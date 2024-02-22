"use client";

import useDrag, { Tuple } from "@/hooks/use-drag";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PropsWithChildren, createContext, useContext } from "react";
import { Node, Point } from "./node";

type PinBoardContextProps = {
	xy: Tuple<number>;
};
const PinboardContext = createContext<PinBoardContextProps>({
	xy: [0, 0],
});

type PinBoardProps = {
	nodes?: Array<Node>;
	onNodesChange?: (nodes: Array<Node>) => void;
};

type PinboardSettings = {
	position?: Point;
};

export function PinBoard({
	nodes,
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
		<PinboardContext.Provider value={{ xy }}>
			<div {...bind} className="w-full h-full relative overflow-hidden">
				{children}
				<NodesContainer nodes={nodes} onNodesChange={onNodesChange} />
			</div>
		</PinboardContext.Provider>
	);
}

function NodesContainer({ nodes, onNodesChange }: PinBoardProps) {
	const {
		xy: [x, y],
	} = useContext(PinboardContext);

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
				<Node key={node.id} data-draggable className="absolute" node={node} />
			))}
		</div>
	);
}

export function Background() {
	const {
		xy: [x, y],
	} = useContext(PinboardContext);

	return (
		<span className="pointer-events-none">
			{/* Border Fade */}
			<span className="absolute inset-0 z-10 shadow-[0_0_0_16px,inset_0_0_8px_16px] shadow-white/80 rounded-[32px]" />

			{/* Dots Pattern */}
			<svg className="absolute inset-0 w-full h-full z-0">
				<pattern
					id="dots-pattern"
					x={x}
					y={y}
					width="10"
					height="10"
					patternUnits="userSpaceOnUse"
					patternTransform="translate(0, 0)"
				>
					<circle cx="1" cy="1" r="1" fill="#ccc" shapeRendering="crispEdges" />
				</pattern>
				<rect
					x="0"
					y="0"
					width="100%"
					height="100%"
					fill="url(#dots-pattern)"
				/>
			</svg>
		</span>
	);
}
