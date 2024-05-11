import { useCallback, useEffect, useRef, useState } from "react";

type HandlerCallback = {
	event: PointerEvent;
	cache: Array<PointerEvent>;
	touches: Array<[number, number]>;
	pointerDown: boolean;
	pinching: boolean;
};

type Handlers = {
	onPointerDown?: (_: HandlerCallback) => void;
	onPointerMove?: (_: HandlerCallback) => void;
	onPointerUp?: (_: HandlerCallback) => void;
};

type Options = {
	target?: React.RefObject<HTMLElement>;
	capture?: boolean;
	types?: Array<string>;
};

export function usePointerEvents(
	handlers?: Handlers,
	{
		target = { current: null },
		capture = false,
		types = ["mouse", "touch"],
	}: Options = {}
) {
	const options = {
		target,
		capture,
		types,
	};

	const cache = useRef<Array<PointerEvent>>([]);

	const getTouches = useCallback(
		(): Array<[number, number]> =>
			cache.current.map(({ clientX, clientY }) => [clientX, clientY]),
		[cache]
	);

	const [pointerDown, setPointerDown] = useState(false);
	const [pinching, setPinching] = useState(false);

	const handlePointerDown = useCallback(
		(event: PointerEvent) => {
			// Ensure correct pointer type
			if (!options.types?.includes(event.pointerType)) {
				return;
			}

			if (!options.target.current?.contains(event.target as HTMLElement)) {
				return;
			}

			// because we handle 'pointerdown' on the document and the element
			// we don't want to track the same pointer multiple times
			if (
				cache.current.find(({ pointerId }) => pointerId === event.pointerId)
			) {
				return;
			}

			cache.current.push(event);

			setPointerDown(true);

			const _pinching = cache.current.length >= 2;
			setPinching(_pinching);

			handlers?.onPointerDown?.({
				event,
				cache: cache.current,
				touches: getTouches(),
				pointerDown: true,
				pinching: _pinching,
			});
		},
		[getTouches, handlers, options.target, options.types]
	);

	const handlePointerMove = useCallback(
		(event: PointerEvent) => {
			// Ensure correct pointer type
			if (!options.types?.includes(event.pointerType)) {
				return;
			}
			// Update cached events
			const index = cache.current.findIndex(
				({ pointerId }) => pointerId === event.pointerId
			);

			if (index === -1) {
				return;
			}

			cache.current[index] = event;

			handlers?.onPointerMove?.({
				event,
				cache: cache.current,
				touches: getTouches(),
				pointerDown,
				pinching,
			});
		},
		[getTouches, handlers, options.types, pinching, pointerDown]
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			// Ensure correct pointer type
			if (!options.types?.includes(event.pointerType)) {
				return;
			}

			// Remove the event from the cache
			const index = cache.current.findIndex(
				({ pointerId }) => pointerId === event.pointerId
			);

			if (index === -1) {
				return;
			}

			cache.current.splice(index, 1);

			const _pointerDown = cache.current.length > 0;
			setPointerDown(_pointerDown);

			const _pinching = cache.current.length >= 2;
			setPinching(_pinching);

			handlers?.onPointerUp?.({
				event,
				cache: cache.current,
				touches: getTouches(),
				pointerDown: _pointerDown,
				pinching: _pinching,
			});
		},
		[getTouches, handlers, options.types]
	);

	// prettier-ignore
	useEffect(() => {
		options?.target.current?.addEventListener("pointerdown", handlePointerDown, options?.capture);
		document.addEventListener("pointerdown", handlePointerDown, options.capture);

		document.addEventListener("pointermove", handlePointerMove, options.capture);
		document.addEventListener("pointerup", handlePointerUp, options?.capture);

		return () => {
			options?.target.current?.removeEventListener("pointerdown",handlePointerDown,options?.capture);
			document.removeEventListener("pointerdown", handlePointerDown, options.capture);

			document.removeEventListener("pointermove",handlePointerMove,options?.capture);
			document.removeEventListener("pointerup",handlePointerUp,options?.capture);
		};
	}, [options.capture, options?.target, options.types, handlers, getTouches, pinching, pointerDown, handlePointerDown, handlePointerMove, handlePointerUp]);

	return { cache, touches: getTouches(), pointerDown };
}
