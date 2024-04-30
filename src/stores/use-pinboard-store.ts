import { Point } from "@/components/pinboard/types";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Transform = Point & { scale: number };

export type PinBoardState = {
	transform: Transform;
	name: string;
};

type PinBoardStore = PinBoardState & {
	actions: {
		zoomReset: () => void;
		setTransform: (transform: Partial<Transform>) => void;
		setName: (name: string) => void;
	};
};

const SCALE_MIN = 0.02;
const SCALE_MAX = 256;
const SCALE_FACTOR = 0.04;

export function calculateScale(scale: number, direction: 1 | -1) {
	return Math.max(
		SCALE_MIN,
		Math.min(scale * Math.pow(1 + SCALE_FACTOR, direction), SCALE_MAX)
	);
}

export function calculateCenterPoint(
	transform: Transform,
	screenPos: Point,
	scale: number = 1
): Point {
	// https://stackoverflow.com/a/45068045
	const ratio = 1 - scale / transform.scale;
	return {
		x: transform.x + (screenPos.x - transform.x) * ratio,
		y: transform.y + (screenPos.y - transform.y) * ratio,
	};
}

const initialState: PinBoardState = {
	transform: {
		x: 0,
		y: 0,
		scale: 1,
	},
	name: "My Awesome PinBoard",
};

export const usePinBoardStore = create(
	persist<PinBoardStore>(
		(set) => ({
			...initialState,
			actions: {
				zoomReset: () =>
					set((state) => {
						if (state.transform.scale === 1) {
							return state;
						}

						const { x, y } = calculateCenterPoint(state.transform, {
							x: document.body.clientWidth / 2,
							y: document.body.clientHeight / 2,
						});

						return {
							transform: {
								x,
								y,
								scale: initialState.transform.scale,
							},
						};
					}),
				setTransform: (transform) =>
					set((state) => ({
						transform: {
							...state.transform,
							...transform,
						},
					})),
				setName: (name) => set({ name }),
			},
		}),
		{
			name: "pinboard",
			partialize: (state) =>
				Object.fromEntries(
					Object.entries(state).filter(([key]) => !["actions"].includes(key))
				) as PinBoardStore,
		}
	)
);

// https://docs.pmnd.rs/zustand/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
export const usePinBoardHydrated = () => {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		// Note: This is just in case you want to take into account manual rehydration.
		// You can remove the following line if you don't need it.
		const unsubHydrate = usePinBoardStore.persist.onHydrate(() =>
			setHydrated(false)
		);

		const unsubFinishHydration = usePinBoardStore.persist.onFinishHydration(
			() => setHydrated(true)
		);

		setHydrated(usePinBoardStore.persist.hasHydrated());

		return () => {
			unsubHydrate();
			unsubFinishHydration();
		};
	}, []);

	return hydrated;
};

export const usePinBoardTransform = () =>
	usePinBoardStore((state) => state.transform);
export const usePinBoardName = () => usePinBoardStore((state) => state.name);

export const usePinBoardActions = () =>
	usePinBoardStore((state) => state.actions);
