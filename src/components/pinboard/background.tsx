import { usePinBoardTransform } from "@/stores/use-pinboard-store";
import { memo } from "react";

function Background() {
	const transform = usePinBoardTransform();

	const gap = 10;
	const size = 2;
	const offset = 2;

	const scaledGap = gap * transform.scale || 1;
	const scaledSize = size * transform.scale;

	const radius = scaledSize / offset;
	const patternOffset = scaledSize / offset;

	return (
		<span className="background absolute top-0 left-0 w-full h-full pointer-events-none">
			{/* Dots Pattern */}
			<svg className="absolute inset-0 w-full h-full -z-10">
				<pattern
					id="dots-pattern"
					x={transform.x % scaledGap}
					y={transform.y % scaledGap}
					width={scaledGap}
					height={scaledGap}
					patternUnits="userSpaceOnUse"
					patternTransform={`translate(-${patternOffset},-${patternOffset})`}
				>
					<circle
						cx={radius}
						cy={radius}
						r={radius}
						fill="#ccc"
						shapeRendering="crispEdges"
					/>
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

export default memo(Background);
