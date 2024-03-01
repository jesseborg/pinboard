"use client";

import useDrag from "@/hooks/use-drag";
import { Node, Nodes, useNodesActions } from "@/stores/use-nodes-store";
import {
	usePinBoardActions,
	usePinBoardName,
	usePinBoardXY,
} from "@/stores/use-pinboard-store";
import { PropsWithChildren, useEffect, useRef } from "react";
import { NodeHandle, NodeTypes } from "./types";

type PinBoardProps = {
	nodes: Nodes | null;
	nodeTypes: NodeTypes;
	onNodesChange?: (nodes: Nodes | null) => void;
};

export function PinBoard({
	nodes,
	nodeTypes,
	onNodesChange,
	children,
}: PropsWithChildren<PinBoardProps>) {
	const { setState } = useNodesActions();
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

	useEffect(() => {
		setState({
			nodes,
			onNodesChange,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div {...bind} className="w-full h-full relative overflow-hidden">
			{children}
			<NameContainer />
			<NodesContainer
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
			/>
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
			id={`${node.id}`}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
			}}
			className="pointer-events-auto absolute"
			onDoubleClick={() => handleRef.current?.onDoubleClick()}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
}

function NodesContainer({ nodes, nodeTypes, onNodesChange }: PinBoardProps) {
	const [x, y] = usePinBoardXY();

	const { bind } = useDrag<HTMLDivElement>(
		({ gridOffset: [ox, oy], target }) => {
			target.style.transform = `translate(${ox}px, ${oy}px)`;

			const id = Number(target.id);
			const node = nodes?.[id];

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
