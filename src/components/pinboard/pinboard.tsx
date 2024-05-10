import useDrag from "@/hooks/use-drag";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useKeyDown } from "@/hooks/use-keydown";
import { useMouseWheel } from "@/hooks/use-mouse-wheel";
import usePinch from "@/hooks/use-pinch";
import { cn } from "@/lib/utils";
import { useNodesActions, useSelectedNodeId } from "@/stores/use-nodes-store";
import {
	SCALE_FACTOR_WHEEL,
	calculateTransform,
	usePinBoardActions,
	usePinBoardHydrated,
	usePinBoardTransform,
} from "@/stores/use-pinboard-store";
import { PropsWithChildren, forwardRef, memo, useEffect, useRef } from "react";
import { UsePinchDebug } from "../debug/use-pinch-debug";
import { NameContainer } from "./name-container";
import { NodeHandle, NodeProps, NodeTypes } from "./types";

type PinBoardProps = {
	nodes: Array<NodeProps<any, any>>;
	nodeTypes: NodeTypes;
	onNodesChange?: (nodes: Array<NodeProps<any, any>>) => void;
};

export function PinBoard({
	children,
	...props
}: PropsWithChildren<PinBoardProps>) {
	const hydrated = usePinBoardHydrated();

	if (!hydrated) {
		return;
	}

	return <DraggablePinBoard {...props}>{children}</DraggablePinBoard>;
}

const MIN_DRAG_DISTANCE = 3;

function DraggablePinBoard({
	children,
	...props
}: PropsWithChildren<PinBoardProps>) {
	const { setTransform, centerOnSelection, zoomIn, zoomOut, zoomReset } =
		usePinBoardActions();

	const transform = usePinBoardTransform();

	const ref = useRef<HTMLDivElement>(null);

	const isPanning = useKeyDown(document.body, " ");

	useKeyDown(
		document.body,
		["0", "-", "=", "."],
		({ key, event }) => {
			event.preventDefault();

			if (!event.ctrlKey && !event.metaKey) {
				return;
			}

			switch (key) {
				case "0":
					zoomReset();
					break;
				case "-":
					zoomOut();
					break;
				case "=":
					zoomIn();
					break;
				case ".": {
					centerOnSelection();
					break;
				}
			}
		},
		{ ignoreWhileInput: true }
	);

	useMouseWheel(
		(event) => {
			if (!event.ctrlKey && !event.metaKey) {
				return;
			}

			if (event.deltaY === 0) {
				return;
			}

			setTransform(
				calculateTransform(
					transform,
					{ x: event.clientX, y: event.clientY },
					event.deltaY > 0 ? -SCALE_FACTOR_WHEEL : SCALE_FACTOR_WHEEL
				)
			);
		},
		{ preventDefault: true },
		[transform]
	);

	return (
		<div
			ref={ref}
			id="pinboard"
			className={cn("pinboard w-full h-full", {
				"cursor-grab [&_*]:!pointer-events-none": isPanning,
			})}
		>
			<PanPinch ref={ref} />
			<div
				id="renderer"
				style={{
					transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
				}}
				className="renderer w-full h-full absolute pointer-events-none origin-top-left"
			>
				<NodesContainer {...props} />
			</div>
			{children}
			<NameContainer />
		</div>
	);
}

const PanPinch = forwardRef<HTMLDivElement>((_, ref) => {
	const { setTransform } = usePinBoardActions();
	const { setSelectedNodeId } = useNodesActions();

	const transform = usePinBoardTransform();

	useDrag(
		({ movement: [mx, my], initialOffset: [ox, oy], pinching }) => {
			// If pinching, ignore drag, movement will be handled in 'usePinch'
			if (pinching) {
				return;
			}

			// Handle dragging the pinboard
			setTransform({ x: ox + mx, y: oy + my });
		},
		{
			onDragStart: () => {
				document.body.style.cursor = "grabbing";
			},
			onDragEnd: ({ movement: [mx, my] }) => {
				document.body.style.cursor = "default";

				// Only allow clicks, this keeps nodes selected if dragging
				if (Math.abs(mx) + Math.abs(my) > MIN_DRAG_DISTANCE) {
					return;
				}

				setSelectedNodeId(null);
			},
			target: ref as React.RefObject<HTMLDivElement>,
			initialPosition: [transform.x, transform.y],
			children: {
				ignore: true,
			},
		}
	);

	const pinch = usePinch(
		{
			onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
				setTransform(calculateTransform(transform, { x: ox, y: oy }, 0, scale));
			},
		},
		{
			target: ref as React.RefObject<HTMLDivElement>,
			offset: [transform.scale, 0],
		}
	);

	return process.env.NODE_ENV === "development" && <UsePinchDebug {...pinch} />;
});

type NodeRendererProps = {
	node: NodeProps<any, any>;
	nodeTypes: NodeTypes;
	onFocus?: (element: HTMLDivElement) => void;
};
function NodeRenderer({ node, nodeTypes, onFocus }: NodeRendererProps) {
	const handleRef = useRef<NodeHandle>(null);

	const { setSelectedNodeId } = useNodesActions();

	const Node = nodeTypes?.[node.type];
	if (Node === undefined) {
		return null;
	}

	function handleFocusNode(element: HTMLDivElement) {
		setSelectedNodeId(node.id);
		onFocus?.(element);
	}

	return (
		<div
			data-draggable
			tabIndex={0}
			id={node.id}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
				zIndex: node.index,
			}}
			className="absolute origin-top-left outline-none"
			onDoubleClick={() => handleRef.current?.onDoubleClick()}
			// On mobile 'onFocus' triggers after holding for a while so this forces focus on pointer down
			// onPointerDown={(e) => handleFocusNode(e.target as HTMLDivElement)}
			onFocus={(e) => handleFocusNode(e.target)}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
}

function NodesContainer({ nodes, nodeTypes }: PinBoardProps) {
	const transform = usePinBoardTransform();

	const selectedNodeId = useSelectedNodeId();
	const { removeNode, setNode } = useNodesActions();
	const { deleteById } = useIndexedDB<Blob>("images");

	const ref = useRef<HTMLDivElement>(null);

	useDrag(
		({ gridOffset: [ox, oy], target, pinching }) => {
			if (pinching) {
				return;
			}

			const x = ox / transform.scale;
			const y = oy / transform.scale;
			target.style.transform = `translate(${x}px, ${y}px)`;
			setNode(target.id, { position: { x, y } });
		},
		{
			target: ref,
			selectors: "[data-draggable=true]",
			offset: [transform.x, transform.y],
			grid: {
				step: [10 * transform.scale, 10 * transform.scale],
			},
		}
	);

	useKeyDown(
		document.body,
		"Delete",
		() => {
			if (!selectedNodeId) {
				return;
			}

			deleteById(selectedNodeId);
			removeNode(selectedNodeId);
		},
		{ ignoreWhileInput: true },
		[removeNode, selectedNodeId]
	);

	// TODO: maybe move into custom hook
	useEffect(() => {
		if (!ref.current) {
			return;
		}

		function centerElementToViewport(element: HTMLElement) {
			if (!ref.current || !ref.current.parentElement) {
				return;
			}

			const elementRect = element.getBoundingClientRect();
			const parentRect = ref.current.parentElement.getBoundingClientRect();
			const viewportRect =
				window.visualViewport ?? document.body.getBoundingClientRect();

			setNode(element.id, {
				position: {
					x:
						((viewportRect.width - elementRect.width) / 2 - parentRect.x) /
						transform.scale,
					y:
						((viewportRect.height - elementRect.height) / 2 - parentRect.y) /
						transform.scale,
				},
			});
		}

		const observer = new MutationObserver((records) => {
			for (const record of records) {
				for (const node of record.addedNodes as NodeListOf<HTMLElement>) {
					if (!node.children.length || !node.dataset["draggable"]) {
						return;
					}

					node.focus();
					centerElementToViewport(node);
				}
			}
		});

		observer.observe(ref.current, {
			childList: true,
			subtree: false,
		});

		return () => observer.disconnect();
	}, [ref, transform, setNode]);

	return (
		<div
			ref={ref}
			id="nodes"
			className="nodes pointer-events-none relative z-10"
		>
			<MemoNodes nodes={nodes} nodeTypes={nodeTypes} />
		</div>
	);
}

const MemoNodes = memo(({ nodes, nodeTypes }: PinBoardProps) => {
	const { setNodes } = useNodesActions();

	function handleNodeFocus(node: NodeProps<any, any>) {
		// hmm... good for now, i guess 😬
		setNodes(
			nodes.map((n) => {
				if (n.id === node.id) {
					return { ...n, index: nodes.length };
				}

				if (n.index >= node.index) {
					return { ...n, index: n.index - 1 };
				}

				return n;
			})
		);
	}

	return (
		<>
			{nodes?.map((node) => (
				<NodeRenderer
					key={node.id}
					node={node}
					nodeTypes={nodeTypes}
					onFocus={() => handleNodeFocus(node)}
				/>
			))}
		</>
	);
});
MemoNodes.displayName = "MemoNodes";
