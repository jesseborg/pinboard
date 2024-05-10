import { snap } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { usePointerEvents } from "./use-pointer-events";

// enum MouseButtons {
// 	LEFT = 0,
// 	MIDDLE = 1,
// 	RIGHT = 2,
// 	BACK = 3,
// 	FORWARD = 4,
// }

export type Tuple<T> = [T, T];

type BaseDragEvent<T extends HTMLElement = HTMLElement> = {
	/** The base mouse event */
	event: MouseEvent;
	/** [x,y] values (pointer position or scroll offset) */
	xy: Tuple<number>; //
	/** Offset since the first gesture */
	offset: Tuple<number>;
	/** (screen space) xy value when the gesture started */
	initial: Tuple<number>;
	/** Offset when the gesture first started */
	initialOffset: Tuple<number>;
	/** Displacement between offset and lastOffset */
	movement: Tuple<number>;
	/** The element being dragged */
	target: T;
};

type DragEvent = BaseDragEvent & {
	/** The current offset position snapped to the grid step */
	gridOffset: Tuple<number>;
	pinching: boolean;
};
type DragStartEvent = BaseDragEvent;
type DragEndEvent = BaseDragEvent & {
	/** The current offset position snapped to the grid step */
	gridOffset: Tuple<number>;
};

type UseDragOptionsProps = {
	target: React.RefObject<HTMLElement>;
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
	onDragEnd?: (event: DragEndEvent) => void;
};

function useDrag(
	onDrag?: ((event: DragEvent) => void) | null,
	options?: UseDragOptionsProps
) {
	// Reference to the element being dragged
	const dragTarget = useRef<HTMLElement | null>(null);

	// Initial position of the pointer when the gesture started
	const [pointerInitial, setPointerInitial] = useState<Tuple<number>>([0, 0]);

	// Current position of the element
	const [offset, setOffset] = useState<Tuple<number>>(
		options?.initialPosition ?? [0, 0]
	);

	// Initial position of the element when the gesture started
	const [initialOffset, setInitialOffset] = useState<Tuple<number>>(offset);

	const updateOffsetInitial = useCallback(
		(value: Tuple<number>) => {
			if (!options?.target.current?.parentElement) {
				return;
			}

			setInitialOffset([
				value[0] - options.target.current.parentElement.offsetLeft,
				value[1] - options.target.current.parentElement.offsetTop,
			]);
		},
		[options?.target]
	);

	const { pointerDown } = usePointerEvents(
		{
			onPointerDown: ({ event }) => {
				// Target needs to be an HTMLElement
				const target = event.target as HTMLElement;

				// If the selector option is set, make sure the target matches it
				if (options?.selectors && !target?.matches(options.selectors)) {
					return;
				}

				// If the ignore children option is true, ignore anything that is not the 'options.target'
				if (options?.children?.ignore && target !== options.target.current) {
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
					updateOffsetInitial([x - ox, y - oy]);
				} else {
					updateOffsetInitial(options?.initialPosition ?? offset);
				}

				options?.onDragStart?.({
					event,
					target,
					xy: [event.clientX, event.clientY],
					movement: [event.clientX - initial[0], event.clientY - initial[1]],
					initial,
					offset,
					initialOffset,
				});
			},
			onPointerMove: ({ event, pointerDown, pinching }) => {
				if (!pointerDown) {
					return;
				}

				if (!event.isPrimary) {
					return;
				}

				if (!options?.target.current || !dragTarget.current) {
					return;
				}

				const { movement, offset, gridOffset } = calculateOffsets(
					event,
					pointerInitial,
					initialOffset,
					options
				);

				setOffset(offset);

				onDrag?.({
					event,
					target: dragTarget.current,
					xy: [event.clientX, event.clientY],
					movement,
					initial: pointerInitial,
					offset,
					gridOffset,
					initialOffset,
					pinching,
				});
			},
			onPointerUp: ({ event }) => {
				if (!options?.target.current || !dragTarget.current) {
					return;
				}

				const { movement, offset, gridOffset } = calculateOffsets(
					event,
					pointerInitial,
					initialOffset,
					options
				);

				dragTarget.current = null;

				options?.onDragEnd?.({
					event,
					initial: pointerInitial,
					movement,
					offset,
					target: event.target as HTMLElement,
					xy: [event.clientX, event.clientY],
					gridOffset,
					initialOffset,
				});
			},
		},
		{
			target: options?.target,
			capture: true,
		}
	);

	return {
		dragging: pointerDown,
	};
}

function calculateOffsets(
	event: PointerEvent,
	pointerInitial: Tuple<number>,
	offsetInitial: Tuple<number>,
	options?: UseDragOptionsProps
) {
	const movement = [
		event.clientX - pointerInitial[0],
		event.clientY - pointerInitial[1],
	] as Tuple<number>;

	const offset = [
		offsetInitial[0] + movement[0],
		offsetInitial[1] + movement[1],
	] as Tuple<number>;

	const gridOffset = options?.grid?.step
		? [snap(offset[0], options.grid.step[0]),snap(offset[1], options.grid.step[1])] as Tuple<number> // prettier-ignore
		: offset;

	return { movement, offset, gridOffset };
}

export default useDrag;
