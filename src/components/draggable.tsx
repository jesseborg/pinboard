import useDrag, { Tuple } from "@/hooks/use-drag";
import { PropsWithChildren, useRef, useState } from "react";
import { Point } from "./node";

type DraggableProps = {
	position?: Point;
};

export function Draggable({
	position,
	children,
}: PropsWithChildren<DraggableProps>) {
	const ref = useRef<HTMLDivElement>(null);

	const [[x, y], setXY] = useState<Tuple<number>>([
		position?.x ?? 0,
		position?.y ?? 0,
	]);

	useDrag(ref, ({ gridOffset }) => setXY(gridOffset), {
		grid: {
			step: [10, 10],
		},
	});

	return (
		<div
			ref={ref}
			style={{ transform: `translate(${x}px, ${y}px)` }}
			className="absolute draggable"
		>
			{children}
		</div>
	);
}
