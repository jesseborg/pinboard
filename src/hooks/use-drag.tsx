import { RefObject, useEffect, useState } from "react";

enum MouseButtons {
	LEFT = 0,
	MIDDLE = 1,
	RIGHT = 2,
	BACK = 3,
	FORWARD = 4,
}

export type Tuple<T> = [T, T];

type BaseDragEvent = {
	event: MouseEvent;
	xy: Tuple<number>; // [x,y] values (pointer position or scroll offset)
	offset: Tuple<number>; // offset since the first gesture
	initial: Tuple<number>; // xy value when the gesture started
	movement: Tuple<number>; // displacement between offset and lastOffset
};

type DragEvent = BaseDragEvent;
type DragStartEvent = BaseDragEvent;
type DragEndEvent = BaseDragEvent;

type UseDragOptionsProps = {
	onDragStart?: (event: DragStartEvent) => void;
	onDragEnd?: (event: DragEndEvent) => void;
};

function useDrag(
	ref: RefObject<Element>,
	onDrag?: (event: DragEvent) => void,
	options?: UseDragOptionsProps
) {
	if (process.env.NODE_ENV === "development") {
		if (typeof ref !== "object" || typeof ref.current === "undefined") {
			console.error("useDrag expects a single ref argument.");
		}
	}

	const [down, setDown] = useState(false);

	const [dragInitial, setDragInitial] = useState<Tuple<number>>([0, 0]);

	const [offset, setOffset] = useState<Tuple<number>>([0, 0]);
	const [offsetInitial, setOffsetInitial] = useState<Tuple<number>>([0, 0]);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		function handleMouseMove(event: MouseEvent) {
			event.stopPropagation();

			if (event.button !== MouseButtons.LEFT) {
				return;
			}

			if (down) {
				const movement = [
					event.clientX - dragInitial[0],
					event.clientY - dragInitial[1],
				] as Tuple<number>;

				const offset = [
					offsetInitial[0] + movement[0],
					offsetInitial[1] + movement[1],
				] as Tuple<number>;

				setOffset(offset);

				onDrag?.({
					event,
					xy: [event.clientX, event.clientY],
					movement,
					initial: dragInitial,
					offset,
				});
			}
		}

		function handleMouseDown(event: MouseEvent) {
			event.stopPropagation();

			if (event.button !== MouseButtons.LEFT) {
				return;
			}

			if (event.target !== ref.current) {
				return;
			}

			setDown(true);

			const initial = [event.clientX, event.clientY] as Tuple<number>;
			setDragInitial(initial);

			// Reset the initial offset to the current offset on mouse down.
			setOffsetInitial(offset);

			options?.onDragStart?.({
				event,
				xy: [event.clientX, event.clientY],
				movement: [event.clientX - initial[0], event.clientY - initial[1]],
				initial,
				offset,
			});
		}

		function handleMouseUp(event: MouseEvent) {
			event.stopPropagation();

			if (event.button !== MouseButtons.LEFT) {
				return;
			}

			setDown(false);

			const { x, y } = (event.target as HTMLElement).getBoundingClientRect();
			const offset = [x, y] as Tuple<number>;
			setOffsetInitial(offset);

			// TODO: Add an option for how many pixels the mouse must move before it's considered a drag.
			options?.onDragEnd?.({
				event,
				xy: [event.clientX, event.clientY],
				movement: [
					event.clientX - dragInitial[0],
					event.clientY - dragInitial[1],
				],
				initial: dragInitial,
				offset,
			});
		}

		const element = ref.current as HTMLElement;
		document.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mousedown", handleMouseDown);
		element.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("mousedown", handleMouseDown);
			element.removeEventListener("mouseup", handleMouseUp);
		};
	}, [ref, options, onDrag, down, dragInitial, offset, offsetInitial]);

	return { down };
}

export default useDrag;
