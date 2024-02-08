import useDrag, { Tuple } from "@/hooks/use-drag";
import { PropsWithChildren, useRef, useState } from "react";

type DraggableProps = {};

export function Draggable({ children }: PropsWithChildren<DraggableProps>) {
	const ref = useRef<HTMLDivElement>(null);

	const [[x, y], setXY] = useState<Tuple<number>>([0, 0]);

	useDrag(ref, {
		onDrag: ({ offset }) => {
			setXY(offset);
		},
	});

	return (
		<div
			ref={ref}
			style={{ transform: `translate(${x}px, ${y}px)` }}
			className="pointer-events-auto [&>*]:pointer-events-none"
		>
			{children}
		</div>
	);
}
