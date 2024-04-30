import useDrag from "@/hooks/use-drag";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useKeyDown } from "@/hooks/use-keydown";
import { useMouseWheel } from "@/hooks/use-mouse-wheel";
import { cn } from "@/lib/utils";
import {
	Node,
	Nodes,
	useNodesActions,
	useSelectedNodeId,
} from "@/stores/use-nodes-store";
import {
	usePinBoardActions,
	usePinBoardHydrated,
	usePinBoardTransform,
} from "@/stores/use-pinboard-store";
import { PropsWithChildren, memo, useEffect, useRef } from "react";
import { NameContainer } from "./name-container";
import { NodeHandle, NodeTypes } from "./types";

type PinBoardProps = {
	nodes: Nodes;
	nodeTypes: NodeTypes;
	onNodesChange?: (nodes: Nodes) => void;
};

function PinBoard({ children, ...props }: PropsWithChildren<PinBoardProps>) {
	const hydrated = usePinBoardHydrated();

	if (!hydrated) {
		return;
	}

	return <DraggablePinBoard {...props}>{children}</DraggablePinBoard>;
}

const MIN_DRAG_DISTANCE = 3;
const SCALE_FACTOR = 0.04;

function DraggablePinBoard({
	children,
	...props
}: PropsWithChildren<PinBoardProps>) {
	const { setTransform } = usePinBoardActions();
	const { setSelectedNodeId } = useNodesActions();

	const transform = usePinBoardTransform();

	const { bind } = useDrag<HTMLDivElement>(
		({ movement: [mx, my], initialOffset: [ox, oy] }) => {
			setTransform({ x: ox + mx, y: oy + my });
		},
		{
			onDragEnd: ({ movement: [mx, my] }) => {
				// Only allow clicks, this keeps nodes selected if dragging
				if (Math.abs(mx) + Math.abs(my) > MIN_DRAG_DISTANCE) {
					return;
				}

				setSelectedNodeId(null);
			},
			initialPosition: [transform.x, transform.y],
			children: {
				ignore: true,
			},
		}
	);

	const isPanning = useKeyDown(document.body, " ");

	useMouseWheel(
		(event) => {
			if (event.deltaY === 0) {
				return;
			}

			const direction = event.deltaY > 0 ? -1 : 1;
			const scale = Math.max(
				0.02,
				Math.min(transform.scale * Math.pow(1 + SCALE_FACTOR, direction), 256)
			);

			// https://stackoverflow.com/a/45068045
			const ratio = 1 - scale / transform.scale;

			if (ratio === 1 || ratio === 0.99) {
				return;
			}

			const x = transform.x + (event.clientX - transform.x) * ratio;
			const y = transform.y + (event.clientY - transform.y) * ratio;

			setTransform({
				x,
				y,
				scale,
			});
		},
		{ ctrlKey: true, preventDefault: true },
		[transform]
	);

	return (
		<div
			{...bind}
			id="pinboard"
			className={cn("pinboard w-full h-full", {
				"cursor-grab [&_*]:!pointer-events-none": isPanning,
			})}
		>
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

type NodeRendererProps = {
	node: Node;
	nodeTypes: NodeTypes;
	onFocus: (element: HTMLDivElement) => void;
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
			}}
			className="absolute origin-top-left"
			onDoubleClick={() => handleRef.current?.onDoubleClick()}
			onClick={(e) => handleFocusNode(e.target as HTMLDivElement)}
			onFocus={(e) => handleFocusNode(e.currentTarget)}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
}

function NodesContainer({ nodes, nodeTypes, onNodesChange }: PinBoardProps) {
	const transform = usePinBoardTransform();

	const selectedNodeId = useSelectedNodeId();
	const { removeNode, setNode, setSelectedNodeId } = useNodesActions();
	const { deleteById } = useIndexedDB<Blob>("images");

	const { bind } = useDrag<HTMLDivElement>(
		({ gridOffset: [ox, oy], target }) => {
			const x = ox / transform.scale;
			const y = oy / transform.scale;
			target.style.transform = `translate(${x}px, ${y}px)`;
			setNode(target.id, { position: { x, y } });
		},
		{
			onDragStart: ({ target }) => setSelectedNodeId(target.id),
			onDragEnd: ({ gridOffset: [ox, oy], movement: [mx, my] }) => {
				const hasDragged = Math.abs(mx) + Math.abs(my) > MIN_DRAG_DISTANCE;

				// Only allow drags
				if (!hasDragged) {
					return;
				}

				const node = nodes?.find((node) => node.id === selectedNodeId);
				if (!node) {
					return;
				}

				node.position = { x: ox / transform.scale, y: oy / transform.scale };
				onNodesChange?.(nodes);
			},
			selectors: "[data-draggable=true]",
			offset: [transform.x, transform.y],
			grid: {
				step: [10 * transform.scale, 10 * transform.scale],
			},
		}
	);

	useKeyDown(
		{ current: document.body },
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
		if (!bind.ref.current) {
			return;
		}

		function centerElementToViewport(element: HTMLElement) {
			if (!bind.ref.current || !bind.ref.current.parentElement) {
				return;
			}

			const elementRect = element.getBoundingClientRect();
			const parentRect = bind.ref.current.parentElement.getBoundingClientRect();
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

		observer.observe(bind.ref.current, {
			childList: true,
			subtree: false,
		});

		return () => observer.disconnect();
	}, [bind.ref, transform, setNode]);

	return (
		<div
			{...bind}
			// style={{ transform: `translate(${x}px, ${y}px)` }}
			className="nodes pointer-events-none relative z-10"
		>
			<MemoNodes nodes={nodes} nodeTypes={nodeTypes} />
		</div>
	);
}

let lastIndex = 0;
const MemoNodes = memo(({ nodes, nodeTypes }: PinBoardProps) => {
	function bringToFront(target: HTMLElement) {
		target.style.zIndex = `${lastIndex++}`;
	}

	function handleNodeFocus(target: HTMLElement) {
		bringToFront(target);
	}

	return (
		<>
			{nodes?.map((node) => (
				<NodeRenderer
					key={node.id}
					node={node}
					nodeTypes={nodeTypes}
					onFocus={handleNodeFocus}
				/>
			))}
		</>
	);
});
MemoNodes.displayName = "MemoNodes";

export default memo(PinBoard);
