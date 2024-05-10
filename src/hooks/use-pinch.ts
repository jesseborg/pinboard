import { euclideanDistance } from "@/lib/utils";
import { SCALE_MAX, SCALE_MIN } from "@/stores/use-pinboard-store";
import { useRef, useState } from "react";
import { usePointerEvents } from "./use-pointer-events";

type PinchGestureState = {
	/** [d,a] absolute distance and angle of the two pointers */
	da: [number, number];
	/** coordinates of the center between the two touch event */
	origin: [number, number];
	/** [scale, angle] offsets (starts withs scale=1) */
	offset: [number, number];
};

type UsePinchHandlers = {
	onPinch?: (state: PinchGestureState) => void;
	onPinchEnd?: (state: PinchGestureState) => void;
};

type UsePinchOptions = {
	target: React.RefObject<HTMLElement>;
	offset?: [number, number];
	scaleRange?: [number, number];
};

function usePinch(
	handlers: UsePinchHandlers,
	{
		target = { current: null },
		offset = [1, 0],
		scaleRange = [SCALE_MIN, SCALE_MAX],
	}: UsePinchOptions
) {
	const options = { target, offset, scaleRange };

	const lastScale = useRef(options.offset[0]);
	const lastDistance = useRef(0);

	const [initialTouch, setInitialTouch] = useState<Array<[number, number]>>([]);

	const { touches } = usePointerEvents(
		{
			onPointerDown: ({ touches }) => {
				// Once two touches are detected, cache the initial touch points
				// and calculate the distance between them
				if (touches.length === 2) {
					setInitialTouch(touches);
					lastDistance.current = euclideanDistance(touches[0], touches[1]);
				}
			},
			onPointerMove: ({ touches, pinching }) => {
				// Need at least two touches to continue
				if (!pinching) {
					return;
				}

				const currentDistance = euclideanDistance(touches[0], touches[1]);

				const scale =
					lastScale.current * (currentDistance / lastDistance.current);

				// offset.current = [scale, 0];
				lastScale.current = Math.max(
					options.scaleRange[0],
					Math.min(scale, options.scaleRange[1])
				);
				lastDistance.current = currentDistance;

				handlers.onPinch?.({
					da: [lastDistance.current, 0],
					origin,
					offset: [lastScale.current, 0],
				});
			},
			onPointerUp: ({ touches }) => {
				// reset the last distance
				lastDistance.current = 0;

				// If less than two touches are left, reset the state
				// this means that the [0]th touch will be kept
				if (touches.length < 2) {
					setInitialTouch([]);
				}
			},
		},
		{ target: options.target, types: ["touch"] }
	);

	const origin = (
		touches.length >= 2
			? [(touches[0][0] + touches[1][0]) / 2, (touches[0][1] + touches[1][1]) / 2] // prettier-ignore
			: []
	) as [number, number];

	return {
		touches,
		initialTouch,
		origin,
	};
}

export default usePinch;
