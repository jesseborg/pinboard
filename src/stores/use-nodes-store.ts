import { NodeProps } from "@/components/pinboard/types";
import { create } from "zustand";

export type Node<T extends NodeProps = NodeProps> = T;
export type Nodes = Array<Node>;

export type NodesState = {
	nodes: Nodes | null;
	onNodesChange?: (nodes: Nodes | null) => void;
};

type NodesStore = NodesState & {
	actions: {
		setState: (state: Partial<NodesState>) => void;
		setNodes: (nodes: Nodes) => void;
	};
};

const initialState: NodesState = {
	nodes: null,
	onNodesChange: () => {},
};

const useNodesStore = create<NodesStore>((set) => ({
	...initialState,
	actions: {
		setState: (state) => set((prev) => ({ ...prev, ...state })),
		setNodes: (nodes) =>
			set((state) => {
				state.onNodesChange?.(nodes);
				return { ...state, nodes };
			}),
	},
}));

export const useNodes = () => useNodesStore((state) => state.nodes);

export const useNodesActions = () => useNodesStore((state) => state.actions);
