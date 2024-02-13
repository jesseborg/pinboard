"use client";

import useDrag, { Tuple } from "@/hooks/use-drag";
import {
	PropsWithChildren,
	createContext,
	useContext,
	useRef,
	useState,
} from "react";
import { Draggable } from "./draggable";
import { Node, renderNode } from "./node";

type PinBoardContextProps = {
	xy: Tuple<number>;
	down: boolean;
};
const PinboardContext = createContext<PinBoardContextProps>({
	xy: [0, 0],
	down: false,
});

type PinBoardProps = {
	nodes?: Array<Node>;
};

export function PinBoard({
	nodes,
	children,
}: PropsWithChildren<PinBoardProps>) {
	const ref = useRef<HTMLDivElement>(null);

	const [xy, setXY] = useState<Tuple<number>>([50, 50]);

	const { down } = useDrag(
		ref,
		({ offset }) => {
			setXY(offset);
		},
		{ offset: xy }
	);

	return (
		<PinboardContext.Provider value={{ xy, down }}>
			<div ref={ref} className="w-full h-full relative overflow-hidden">
				{children}
				<NodesContainer nodes={nodes} />
			</div>
		</PinboardContext.Provider>
	);
}

function NodesContainer({ nodes }: { nodes?: PinBoardProps["nodes"] }) {
	const {
		xy: [x, y],
	} = useContext(PinboardContext);

	if (!Boolean(nodes?.length)) {
		return null;
	}

	return (
		<div
			style={{ transform: `translate(${x}px, ${y}px)` }}
			className="z-10 pointer-events-none"
		>
			{nodes?.map((node, i) => (
				<Draggable key={node.id} position={node.position}>
					<div className="border-2 border-black p-2 bg-white shadow-[2px_2px] shadow-black">
						{renderNode(node)}
					</div>
				</Draggable>
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
