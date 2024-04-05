"use client";

import useDrag from "@/hooks/use-drag";
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
import {
	PropsWithChildren,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
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
		({ offset: [x, y], movement: [mx, my] }) => {
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

	return (
		<div {...bind} className="w-full h-full relative overflow-hidden">
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
		element.focus();
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
			className="pointer-events-auto absolute"
			onDoubleClick={() => handleRef.current?.onDoubleClick()}
			onClick={(e) => handleFocusNode(e.target as HTMLDivElement)}
			onFocus={(e) => handleFocusNode(e.target)}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
}

function NodesContainer({ nodes, nodeTypes, onNodesChange }: PinBoardProps) {
	const [x, y] = usePinBoardXY();

	const selectedNodeId = useSelectedNodeId();
	const { removeNode, setNode } = useNodesActions();

	const [z, setZ] = useState(nodes?.length ?? 0);

	function bringToFront(target: HTMLElement) {
		target.style.zIndex = `${z}`;
		setZ(z + 1);
	}

	function handleNodeFocus(target: HTMLElement) {
		bringToFront(target);
	}

	const centerElement = useCallback(
		(element: HTMLElement) => {
			const { width, height } = element.getBoundingClientRect();
			setNode(element.id, {
				position: {
					x: (window.innerWidth - width) / 2 - x,
					y: (window.innerHeight - height) / 2 - y,
				},
			});
		},
		[setNode, x, y]
	);

	const { bind } = useDrag<HTMLDivElement>(
		({ gridOffset: [ox, oy], target }) => {
			target.style.transform = `translate(${ox}px, ${oy}px)`;

			const node = nodes?.find((n) => n.id === target.id);

			if (node) {
				node.position = { x: ox, y: oy };
				onNodesChange?.(nodes);
			}
		},
		{
			selectors: "[data-draggable=true]",
			offset: [x, y],
			grid: {
				step: [10, 10],
			},
		}
	);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (!selectedNodeId) {
				return;
			}

			if (event.key === "Delete") {
				removeNode(selectedNodeId);
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [removeNode, selectedNodeId]);

	useEffect(() => {
		const observer = new MutationObserver((records) => {
			for (const record of records) {
				for (const node of record.addedNodes as NodeListOf<HTMLElement>) {
					node.focus();
					centerElement(node);
				}
			}
		});

		observer.observe(bind.ref.current as HTMLDivElement, {
			childList: true,
			subtree: false,
		});

		return () => observer.disconnect();
	}, [bind.ref, centerElement]);

	if (!Boolean(nodes?.length)) {
		return null;
	}

	return (
		<div
			{...bind}
			style={{ transform: `translate(${x}px, ${y}px)` }}
			className="pointer-events-none relative z-10"
		>
			{nodes?.map((node) => (
				<NodeRenderer
					key={node.id}
					node={node}
					nodeTypes={nodeTypes}
					onFocus={handleNodeFocus}
				/>
			))}
		</div>
	);
}
