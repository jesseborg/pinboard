"use client";

import { Node, NodeHandle } from "@/components/nodes/types";
import useDrag, { Tuple } from "@/hooks/use-drag";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePinboard } from "@/hooks/use-pinboard";
import {
	ComponentType,
	PropsWithChildren,
	Ref,
	createContext,
	useRef,
} from "react";

type PinBoardContextProps = {
	xy: Tuple<number>;
	nodes?: Array<Node>;
	setNodes?: (nodes: Array<Node>) => void;
	nodeTypes?: NodeTypes | null;
};
export const PinboardContext = createContext<PinBoardContextProps>({
	xy: [0, 0],
	nodeTypes: null,
});

export type Point = {
	x: number;
	y: number;
};

export type NodeProps<T = {}> = {
	id: string;
	position: Point;
} & T;

type NodeTypes<T extends NodeProps = any> = Record<
	string,
	ComponentType<CustomNode<T>>
>;

export type CustomNode<T extends NodeProps> = {
	node: T;
	handleRef: Ref<NodeHandle>;
};

type PinBoardProps = {
	nodes?: Array<Node>;
	nodeTypes?: NodeTypes;
	onNodesChange?: (nodes: Array<Node>) => void;
};

type PinboardSettings = {
	position?: Point;
};

export function PinBoard({
	nodes,
	nodeTypes,
	onNodesChange,
	children,
}: PropsWithChildren<PinBoardProps>) {
	const [settings, setSettings] = useLocalStorage<PinboardSettings>("settings");

	const { bind, offset: xy } = useDrag<HTMLDivElement>(
		({ offset: [x, y] }) => {
			setSettings({ position: { x, y } });
		},
		{
			initialPosition: [settings?.position?.x ?? 0, settings?.position?.y ?? 0],
			children: {
				ignore: true,
			},
		}
	);

	return (
		<PinboardContext.Provider
			value={{ xy, nodes, setNodes: onNodesChange, nodeTypes }}
		>
			<div {...bind} className="w-full h-full relative overflow-hidden">
				{children}
				<NodesContainer nodes={nodes} onNodesChange={onNodesChange} />
			</div>
		</PinboardContext.Provider>
	);
}

type NodeRendererProps = { node: Node };
const NodeRenderer = ({ node }: NodeRendererProps) => {
	const { nodeTypes } = usePinboard();

	const handleRef = useRef<NodeHandle>(null);

	const Node = nodeTypes?.[node.type];
	if (Node === undefined) {
		return null;
	}

	function handleDoubleClick() {
		handleRef.current?.handleDoubleClick();
	}

	return (
		<div
			data-draggable
			key={node.id}
			id={node.id}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
			}}
			className="pointer-events-auto absolute"
			onDoubleClick={handleDoubleClick}
		>
			<Node handleRef={handleRef} node={node} />
		</div>
	);
};

function NodesContainer({ nodes, onNodesChange }: PinBoardProps) {
	const {
		xy: [x, y],
	} = usePinboard();

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
