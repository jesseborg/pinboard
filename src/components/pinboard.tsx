"use client";

import useDrag, { Tuple } from "@/hooks/use-drag";
import {
	PropsWithChildren,
	createContext,
	useContext,
	useRef,
	useState,
} from "react";

// const initialNodes = [
// 	{
// 		id: "1",
// 		data: { label: "Hello" },
// 		position: { x: 0, y: 0 },
// 		type: "input",
// 	},
// 	{
// 		id: "2",
// 		data: { label: "World" },
// 		position: { x: 100, y: 100 },
// 	},
// ];

type PinBoardContextProps = {
	xy: Tuple<number>;
	down: boolean;
};
const PinboardContext = createContext<PinBoardContextProps>({
	xy: [0, 0],
	down: false,
});

type PinBoardProps = {
	nodes?: Array<string>;
};

export function PinBoard({
	nodes,
	children,
}: PropsWithChildren<PinBoardProps>) {
	const ref = useRef<HTMLDivElement>(null);

	const [xy, setXY] = useState<Tuple<number>>([0, 0]);

	const { down } = useDrag(ref, {
		onDrag: ({ offset }) => {
			setXY(offset);
		},
	});

	return (
		<PinboardContext.Provider value={{ xy, down }}>
			<div ref={ref} className="w-full h-full relative overflow-hidden">
				{children}
				<NodesContainer nodes={nodes} />
			</div>
		</PinboardContext.Provider>
	);
}

function NodesContainer({ nodes }: { nodes?: Array<string> }) {
	const {
		xy: [x, y],
	} = useContext(PinboardContext);

	if (!Boolean(nodes?.length)) {
		return null;
	}

	return (
		<div style={{ transform: `translate(${x}px, ${y}px)` }} className="z-10">
			{nodes?.map((s, i) => (
				<h1 className="bg-red-500" key={i}>
					{s}
				</h1>
			))}
		</div>
	);
}

export function Background() {
	const {
		xy: [x, y],
	} = useContext(PinboardContext);

	return (
		<svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
			<pattern
				id="dots-pattern"
				x={x}
				y={y}
				width="10"
				height="10"
				patternUnits="userSpaceOnUse"
				patternTransform="translate(0, 0)"
			>
				<circle cx="4" cy="4" r="1" fill="#ccc" />
			</pattern>

			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="url(#dots-pattern)"
			></rect>
		</svg>
	);
}
