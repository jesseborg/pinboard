import { Node } from "@/components/nodes/types";
import { NodeTypes } from "@/components/pinboard/types";
import { Tuple } from "@/hooks/use-drag";
import { create } from "zustand";

export type PinBoardState = {
	xy: Tuple<number>;
	nodes: Array<Node> | null;
	nodeTypes?: NodeTypes | null;
	onNodesChange?: (nodes: Array<Node> | null) => void;
};

type PinBoardStore = PinBoardState & {
	actions: {
		setState: (state: Partial<PinBoardState>) => void;
		setXY: (xy: Tuple<number>) => void;
		setNodes: (nodes: Array<Node>) => void;
		setNodeTypes: (nodeTypes?: NodeTypes) => void;
	};
};

const initialState: PinBoardState = {
	xy: [0, 0],
	nodes: null,
	nodeTypes: null,
	onNodesChange: () => {},
};

const usePinboardStore = create<PinBoardStore>((set) => ({
	...initialState,
	actions: {
		setState: (state) => set((prev) => ({ ...prev, ...state })),
		setXY: (xy) => set({ xy }),
		setNodes: (nodes) =>
			set((state) => {
				state.onNodesChange?.(nodes);
				return { ...state, nodes };
			}),
		setNodeTypes: (nodeTypes) => set({ nodeTypes }),
	},
}));

export const usePinBoardXY = () => usePinboardStore((state) => state.xy);
export const usePinBoardNodes = () => usePinboardStore((state) => state.nodes);
export const usePinBoardNodeTypes = () =>
	usePinboardStore((state) => state.nodeTypes);

export const usePinBoardActions = () =>
	usePinboardStore((state) => state.actions);
