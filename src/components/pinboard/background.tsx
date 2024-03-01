import { usePinBoardXY } from "@/stores/use-pinboard-store";

export function Background() {
	const [x, y] = usePinBoardXY();

	return (
		<span className="pointer-events-none">
			{/* Dots Pattern */}
			<svg className="absolute inset-0 w-full h-full -z-10">
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

			{/* Border Fade */}
			{/* <span className="absolute inset-0 z-20 shadow-[0_0_0_16px,inset_0_0_8px_16px] shadow-white/80 rounded-[32px]" /> */}
		</span>
	);
}
