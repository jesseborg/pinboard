"use client";

import useDrag from "@/hooks/use-drag";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
	Node,
	PinBoardState,
	usePinBoardActions,
	usePinBoardNodeTypes,
	usePinBoardXY,
} from "@/stores/use-pinboard-store";
import { PropsWithChildren, useEffect, useRef } from "react";
import { NodeHandle, Point } from "./types";

type PinBoardProps = Omit<PinBoardState, "xy">;

type PinboardSettings = {
	position?: Point;
};

export function PinBoard({
	nodes,
	nodeTypes,
	onNodesChange,
	children,
}: PropsWithChildren<PinBoardProps>) {
	const { setState, setXY } = usePinBoardActions();
	const [settings, setSettings] = useLocalStorage<PinboardSettings>("settings");

	const { bind } = useDrag<HTMLDivElement>(
		({ offset: [x, y] }) => {
			// Update settings in localStorage
			setSettings({ position: { x, y } });

			// Update pinboard store state
			setXY([x, y]);
		},
		{
			initialPosition: [settings?.position?.x ?? 0, settings?.position?.y ?? 0],
			children: {
				ignore: true,
			},
		}
	);

	useEffect(() => {
		setState({
			xy: [settings?.position?.x ?? 0, settings?.position?.y ?? 0],
			nodes,
			nodeTypes,
			onNodesChange,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div {...bind} className="w-full h-full relative overflow-hidden">
			{children}
			<NodesContainer nodes={nodes} onNodesChange={onNodesChange} />
		</div>
	);
}

function NodeRenderer({ node }: { node: Node }) {
	const nodeTypes = usePinBoardNodeTypes();

	const handleRef = useRef<NodeHandle>(null);

	const Node = nodeTypes?.[node.type];
	if (Node === undefined) {
		return null;
	}

	return (
		<div
			data-draggable
			key={node.id}
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

function NodesContainer({ nodes, onNodesChange }: PinBoardProps) {
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
			className="z-10 pointer-events-none relative"
		>
			{nodes?.map((node) => (
				<NodeRenderer key={node.id} node={node} />
			))}
		</div>
	);
}
