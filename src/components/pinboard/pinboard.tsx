"use client";

import useDrag from "@/hooks/use-drag";
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
	usePinBoardName,
	usePinBoardXY,
} from "@/stores/use-pinboard-store";
import {
	FocusEvent,
	PropsWithChildren,
	useEffect,
	useRef,
	useState,
} from "react";
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
		<div
			{...bind}
			// onClick={handleClick}
			className="w-full h-full relative overflow-hidden"
		>
			{children}
			<NameContainer />
			<NodesContainer {...props} />
		</div>
	);
}

function NameContainer() {
	const name = usePinBoardName();
	const { setName } = usePinBoardActions();

	const [editing, setEditing] = useState(false);

	function handleBlur(event: FocusEvent) {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(event.target)) {
			window.getSelection()?.empty();
		}
	}

	return (
		<div className="absolute flex w-full justify-center pt-6 z-50">
			<input
				autoComplete="off"
				autoCapitalize="off"
				autoCorrect="off"
				readOnly={!editing}
				spellCheck={editing}
				maxLength={25}
				className={cn(
					"px-4 py-2 bg-white text-sm font-light w-64 shadow-sm text-center cursor-default outline-none",
					{
						"cursor-text outline outline-2": editing,
					}
				)}
				defaultValue={name}
				onChange={({ target: { value } }) => setName(value)}
				onDoubleClick={() => setEditing(true)}
				onBlur={handleBlur}
			/>
		</div>
	);
}

type NodeRendererProps = {
	node: Node;
	nodeTypes: NodeTypes;
};
function NodeRenderer({ node, nodeTypes }: NodeRendererProps) {
	const handleRef = useRef<NodeHandle>(null);

	const Node = nodeTypes?.[node.type];
	if (Node === undefined) {
		return null;
	}

	return (
		<div
			data-draggable
			id={node.id}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
			}}
			className="pointer-events-auto absolute"
			onDoubleClick={() => handleRef.current?.onDoubleClick()}
			onClick={(e) => (e.target as HTMLElement).focus()}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
}

function NodesContainer({ nodes, nodeTypes, onNodesChange }: PinBoardProps) {
	const [x, y] = usePinBoardXY();

	const selectedNodeId = useSelectedNodeId();
	const { removeNode, setSelectedNodeId } = useNodesActions();

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
			onDragStart: ({ target }) => setSelectedNodeId(target.id),
			selectors: "[data-draggable=true]",
			offset: [x, y],
			grid: {
				step: [10, 10],
			},
		}
	);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Avoid collision with inputs, etc.
			if (document.activeElement !== document.body) {
				return;
			}

			if (event.key === "Delete") {
				if (selectedNodeId === null) {
					return;
				}

				removeNode(selectedNodeId);
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [removeNode, selectedNodeId]);

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
				<NodeRenderer key={node.id} node={node} nodeTypes={nodeTypes} />
			))}
		</div>
	);
}
