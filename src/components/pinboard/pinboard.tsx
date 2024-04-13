"use client";

import useDrag from "@/hooks/use-drag";
import { useKeyDown } from "@/hooks/use-keydown";
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
	usePinBoardXY,
} from "@/stores/use-pinboard-store";
import { PropsWithChildren, memo, useEffect, useRef } from "react";
import { NameContainer } from "./name-container";
import { NodeHandle, NodeTypes } from "./types";

type PinBoardProps = {
	nodes: Nodes | null;
	nodeTypes: NodeTypes;
	onNodesChange?: (nodes: Nodes | null) => void;
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
	const { setXY } = usePinBoardActions();
	const xy = usePinBoardXY();

	const { setSelectedNodeId } = useNodesActions();

	const { bind } = useDrag<HTMLDivElement>(
		({ offset: [x, y] }) => {
			// Update pinboard store state
			setXY([x, y]);
		},
		{
			onDragEnd: ({ event, movement: [mx, my] }) => {
				// Only allow click events on the pinboard container (not nodes)
				if (event.target !== bind.ref.current) {
					return;
				}

				const hasDragged = Math.abs(mx) + Math.abs(my) > MIN_DRAG_DISTANCE;

				// Only allow clicks, this keeps nodes selected if dragging
				if (hasDragged) {
					return;
				}

				setSelectedNodeId(null);
			},
			initialPosition: xy,
			children: {
				ignore: true,
			},
		}
	);

	const isPanning = useKeyDown({ current: document.body }, " ");

	return (
		<div
			{...bind}
			id="pinboard"
			className={cn("w-full h-full relative overflow-hidden", {
				"cursor-grab [&_*]:!pointer-events-none": isPanning,
			})}
		>
			{children}
			<NameContainer />
			<NodesContainer {...props} />
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

		const pinboard = document.getElementById("pinboard");
		if (pinboard) {
			pinboard.scrollLeft = 0;
			pinboard.scrollTop = 0;
		}
	}

	return (
		<div
			data-draggable
			tabIndex={0}
			id={node.id}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
			}}
			className="absolute"
			onDoubleClick={() => handleRef.current?.onDoubleClick()}
			onClick={(e) => handleFocusNode(e.target as HTMLDivElement)}
			onFocus={(e) => handleFocusNode(e.currentTarget)}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
}

function NodesContainer({ nodes, nodeTypes, onNodesChange }: PinBoardProps) {
	const [x, y] = usePinBoardXY();

	const selectedNodeId = useSelectedNodeId();
	const { removeNode, setNode } = useNodesActions();

	const { bind } = useDrag<HTMLDivElement>(
		({ gridOffset: [ox, oy], target }) => {
			target.style.transform = `translate(${ox}px, ${oy}px)`;
		},
		{
			onDragEnd: ({ gridOffset: [ox, oy] }) => {
				const node = nodes?.find((node) => node.id === selectedNodeId);
				if (!node) {
					return;
				}

				node.position = { x: ox, y: oy };
				onNodesChange?.(nodes);
			},
			selectors: "[data-draggable=true]",
			offset: [x, y],
			grid: {
				step: [10, 10],
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

			removeNode(selectedNodeId);
		},
		{ ignoreWhileInput: true },
		[removeNode, selectedNodeId]
	);

	useEffect(() => {
		if (!bind.ref.current) {
			return;
		}

		function centerElement(element: HTMLElement) {
			if (!bind.ref.current || !bind.ref.current.parentElement) {
				return;
			}

			const { width: nodeWidth, height: nodeHeight } =
				element.getBoundingClientRect();
			const { width: parentWidth, height: parentHeight } =
				bind.ref.current.parentElement.getBoundingClientRect();

			setNode(element.id, {
				position: {
					x: (parentWidth - nodeWidth) / 2 - x,
					y: (parentHeight - nodeHeight) / 2 - y,
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
					centerElement(node);
				}
			}
		});

		observer.observe(bind.ref.current, {
			childList: true,
			subtree: false,
		});

		return () => observer.disconnect();
	}, [bind.ref, x, y, setNode]);

	return (
		<div
			{...bind}
			style={{ transform: `translate(${x}px, ${y}px)` }}
			className="pointer-events-none relative z-10"
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
