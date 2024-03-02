import { NodeProps, NodeTypes } from "@/components/pinboard/types";
import { ComponentProps } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Node<T extends NodeProps = NodeProps> = T;
export type Nodes = Array<Node>;

export type NodesState = {
	nodes: Nodes | null;
};

type NodeActions<T extends NodeTypes = {}> = {
	setNodes: (nodes: Nodes | null) => void;
	addNode: <K extends keyof T>(
		type: K,
		node?: Partial<ComponentProps<T[K]>["node"]>
	) => void;
};

type NodesStore = NodesState & {
	actions: NodeActions;
};

const initialState: NodesState = {
	nodes: null,
};

const useNodesStore = create(
	persist<NodesStore>(
		(set) => ({
			...initialState,
			actions: {
				setNodes: (nodes) => set({ nodes }),
				addNode: (type, data) =>
					set((state) => {
						const nodes = state.nodes ?? [];
						const node = {
							id: nodes.length,
							position: { x: 0, y: 0 },
							type,
							...data,
						};

						nodes.push(node);

						return { nodes };
					}),
			},
		}),
		{
			name: "nodes",
			partialize: (state) =>
				Object.fromEntries(
					Object.entries(state).filter(([key]) => !["actions"].includes(key))
				) as NodesStore,
		}
	)
);

export const useNodes = () => useNodesStore((state) => state.nodes);

export const useNodesActions = <T extends NodeTypes = {}>() =>
	useNodesStore((state) => state.actions as NodeActions<T>);
