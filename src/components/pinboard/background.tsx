import { useContext } from "react";
import { PinboardContext } from "./pinboard";

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
