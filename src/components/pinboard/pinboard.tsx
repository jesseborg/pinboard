"use client";

import useDrag from "@/hooks/use-drag";
import { Node, Nodes, useNodesActions } from "@/stores/use-nodes-store";
import {
	usePinBoardActions,
	usePinBoardHydrated,
	usePinBoardName,
	usePinBoardXY,
} from "@/stores/use-pinboard-store";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
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

function DraggablePinBoard({
	children,
	...props
}: PropsWithChildren<PinBoardProps>) {
	const { setXY } = usePinBoardActions();
	const xy = usePinBoardXY();

	const { bind } = useDrag<HTMLDivElement>(
		({ offset: [x, y] }) => {
			// Update pinboard store state
			setXY([x, y]);
		},
		{
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

function NameContainer() {
	const name = usePinBoardName();

	return (
		<div className="absolute flex w-full justify-center pt-6 z-50">
			<p className="px-4 py-2 bg-white text-sm font-light shadow-sm">{name}</p>
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
	const { removeNode } = useNodesActions();

	const [targetId, setTargetId] = useState<string | null>(null);

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
			onDragStart: ({ target }) => setTargetId(target.id),
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
				if (targetId === null) {
					return;
				}

				removeNode(targetId);
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [removeNode, targetId]);

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
