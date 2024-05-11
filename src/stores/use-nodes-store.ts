import { NodeProps, NodeTypes } from "@/components/pinboard/types";
import { uuid4 } from "@/lib/utils";
import { ComponentProps } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export type NodesState = {
	nodes: Array<NodeProps>;
	selectedNodeId: string | null;
};

type NodeActions<T extends NodeTypes> = {
	setNode: <N extends NodeProps<string>>(
		id: string,
		node: RecursivePartial<N>
	) => void;
	setNodes: (nodes: Array<NodeProps>) => void;
	removeNode: (id: string) => void;
	addNode: <K extends keyof T>(
		type: K,
		node?: Omit<ComponentProps<T[K]>["node"], "id" | "type">
	) => void;
	setSelectedNodeId: (id: string | null) => void;
};

type NodesStore = NodesState & {
	actions: NodeActions<NodeTypes>;
};

const initialState: NodesState = {
	nodes: [],
	selectedNodeId: null,
};

export const useNodesStore = create(
	persist<NodesStore>(
		(set) => ({
			...initialState,
			actions: {
				setNode: (id, node) =>
					set((state) => ({
						nodes: state.nodes.map((n) => {
							if (n.id == id) {
								return { ...n, ...node, data: { ...n.data, ...node.data } };
							}
							return n;
						}),
					})),
				setNodes: (nodes) => set({ nodes }),
				removeNode: (id) =>
					set((state) => ({
						nodes: state.nodes.filter((node) => node.id !== id),
						selectedNodeId: null,
					})),
				addNode: (type, node) =>
					set((state) => ({
						nodes: [
							...state.nodes,
							{
								position: { x: 0, y: 0 },
								...node,
								id: uuid4(),
								type,
							} as (typeof state.nodes)[number],
						],
					})),
				setSelectedNodeId: (id) => set({ selectedNodeId: id }),
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
export const useSelectedNodeId = () =>
	useNodesStore((state) => state.selectedNodeId);

export const useNodesActions = <T extends NodeTypes>() =>
	useNodesStore((state) => state.actions as NodeActions<T>);
