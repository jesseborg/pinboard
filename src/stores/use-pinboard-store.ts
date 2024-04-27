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
		setTransform: (transform: Partial<Transform>) => void;
		setName: (name: string) => void;
	};
};

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
