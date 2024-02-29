import { Tuple } from "@/hooks/use-drag";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PinBoardState = {
	xy: Tuple<number>;
};

type PinBoardStore = PinBoardState & {
	actions: {
		setXY: (xy: Tuple<number>) => void;
	};
};

const initialState: PinBoardState = {
	xy: [0, 0],
};

const usePinBoardStore = create(
	persist<PinBoardStore>(
		(set) => ({
			...initialState,
			actions: {
				setXY: (xy) => set({ xy }),
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

export const usePinBoardXY = () => usePinBoardStore((state) => state.xy);

export const usePinBoardActions = () =>
	usePinBoardStore((state) => state.actions);
