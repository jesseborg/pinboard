import usePinch from "@/hooks/use-pinch";

export function UsePinchDebug({
	touches,
	initialTouch,
	origin,
}: ReturnType<typeof usePinch>) {
	return (
		<div className="absolute inset-0 pointer-events-none">
			<svg className="w-full h-screen">
				{touches.length > 1 && (
					<line
						x1={touches[0][0]}
						y1={touches[0][1]}
						x2={touches[1][0]}
						y2={touches[1][1]}
						stroke="green"
					/>
				)}
				{origin.length && (
					<circle cx={origin[0]} cy={origin[1]} r={4} fill="red" />
				)}
				{touches.map((touch, index) => {
					return (
						<rect
							key={index}
							x={touch[0] - 4}
							y={touch[1] - 4}
							className="fill-red-500 size-2 absolute"
						/>
					);
				})}
				{initialTouch.map((touch, index) => {
					return (
						<rect
							key={index}
							x={touch[0] - 4}
							y={touch[1] - 4}
							className="fill-blue-500 size-2 absolute"
						/>
					);
				})}
			</svg>
		</div>
	);
}
