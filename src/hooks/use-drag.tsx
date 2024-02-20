import { snap } from "@/utils/snap";
import { useCallback, useEffect, useRef, useState } from "react";

enum MouseButtons {
	LEFT = 0,
	MIDDLE = 1,
	RIGHT = 2,
	BACK = 3,
	FORWARD = 4,
}

export type Tuple<T> = [T, T];

type BaseDragEvent = {
	/** The base mouse event */
	event: MouseEvent;
	/** [x,y] values (pointer position or scroll offset) */
	xy: Tuple<number>; //
	/** Offset since the first gesture */
	offset: Tuple<number>;
	/** xy value when the gesture started */
	initial: Tuple<number>;
	/** Displacement between offset and lastOffset */
	movement: Tuple<number>;
	/** The element being dragged */
	target: HTMLElement;
};

type DragEvent = BaseDragEvent & {
	/** The current offset position snapped to the grid step */
	gridOffset: Tuple<number>;
};
type DragStartEvent = BaseDragEvent | { event: React.MouseEvent };
type DragEndEvent = BaseDragEvent;

type UseDragOptionsProps = {
	/** Initial position of the element */
	initialPosition?: Tuple<number>;
	/** Offset the drag by [x,y] pixels */
	offset?: Tuple<number>;
	grid?: {
		/** [x,y] values for the grid stepping */
		step?: Tuple<number>;
	};
	/** Only accept drag events from the elements that match this CSS selector */
	selectors?: string;
	children?: {
		/** Ignore drag events from children of the `bind` consumer */
		ignore?: boolean;
	};
	onDragStart?: (event: DragStartEvent) => void;
};

function useDrag<T extends HTMLElement>(
	onDrag?: ((event: DragEvent) => void) | null,
	options?: UseDragOptionsProps
) {
	// Main element that holds all the events
	const ref = useRef<T | null>(null);

	// Reference to the element being dragged
	const dragTarget = useRef<HTMLElement | null>(null);

	// Pressed state of the pointer
	const [down, setDown] = useState(false);

	// Initial position of the pointer when the gesture started
	const [pointerInitial, setPointerInitial] = useState<Tuple<number>>([0, 0]);

	// Current position of the element
	const [offset, setOffset] = useState<Tuple<number>>(
		options?.initialPosition ?? [0, 0]
	);

	// Initial position of the element when the gesture started
	const [offsetInitial, setOffsetInitial] = useState<Tuple<number>>(offset);

	const onMouseDown = useCallback(
		(event: React.MouseEvent) => {
			// Target needs to be an HTMLElement
			const target = event.target as HTMLElement;

			// If the selector option is set, make sure the target matches it
			if (options?.selectors && !target.matches(options.selectors)) {
				return;
			}

			// If the ignore children option is true, ignore anything that is not the 'ref'
			if (options?.children?.ignore && target !== ref.current) {
				return;
			}

			// After all checks have passed, set the target
			dragTarget.current = target;

			const initial = [event.clientX, event.clientY] as Tuple<number>;
			setPointerInitial(initial);

			if (options?.offset) {
				// Get the position relative to the offset
				const { x, y } = target.getBoundingClientRect();
				const [ox, oy] = options.offset;
				setOffsetInitial([x - ox, y - oy]);
			} else {
				setOffsetInitial(offset);
			}

			setDown(true);

			options?.onDragStart?.({
				event,
				target,
				xy: [event.clientX, event.clientY],
				movement: [event.clientX - initial[0], event.clientY - initial[1]],
				initial,
				offset,
			});
		},
		[offset, options]
	);

	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!ref.current || !dragTarget.current) {
				return;
			}

			if (down) {
				const movement = [
					event.clientX - pointerInitial[0],
					event.clientY - pointerInitial[1],
				] as Tuple<number>;

				const offset = [
					offsetInitial[0] + movement[0],
					offsetInitial[1] + movement[1],
				] as Tuple<number>;

				const gridOffset = options?.grid?.step
					? ([
							snap(offset[0], options.grid.step[0]),
							snap(offset[1], options.grid.step[1]),
					  ] as Tuple<number>)
					: offset;

				setOffset(offset);

				onDrag?.({
					event,
					target: dragTarget.current,
					xy: [event.clientX, event.clientY],
					movement,
					initial: pointerInitial,
					offset,
					gridOffset,
				});
			}
		},
		[down, offsetInitial, onDrag, options?.grid?.step, pointerInitial]
	);

	const onMouseUp = useCallback((_: MouseEvent) => {
		if (!ref.current || !dragTarget.current) {
			return;
		}

		dragTarget.current = null;
		setDown(false);
	}, []);

	const handleMouseEvent = useCallback(
		(event: MouseEvent | React.MouseEvent) => {
			event.stopPropagation();

			if (event.button !== MouseButtons.LEFT) {
				return;
			}

			switch (event.type) {
				case "mousedown": {
					onMouseDown(event as React.MouseEvent);
					break;
				}

				case "mousemove": {
					onMouseMove(event as MouseEvent);
					break;
				}

				case "mouseup": {
					onMouseUp(event as MouseEvent);
					break;
				}
			}
		},
		[onMouseDown, onMouseMove, onMouseUp]
	);

	useEffect(() => {
		document.addEventListener("mousemove", handleMouseEvent);
		document.addEventListener("mouseup", handleMouseEvent);

		return () => {
			document.removeEventListener("mousemove", handleMouseEvent);
			document.removeEventListener("mouseup", handleMouseEvent);
		};
	}, [handleMouseEvent]);

	return {
		bind: { ref, onMouseDown: handleMouseEvent },
		target: dragTarget,
		offset,
	};
}

export default useDrag;
