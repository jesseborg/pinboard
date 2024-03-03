"use client";

import { NodeProps, NodeTypes } from "@/components/pinboard/types";
import { uuid4 } from "@/lib/guid";
import { ComponentProps } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Node<T extends NodeProps = NodeProps> = T;
export type Nodes = Array<Node>;

export type NodesState = {
	nodes: Nodes | null;
};

type NodeActions<T extends NodeTypes<NodeProps> = {}> = {
	setNode: <N extends NodeProps>(id: string, node: Partial<N>) => void;
	setNodes: (nodes: Nodes | null) => void;
	removeNode: (id: string) => void;
	addNode: <K extends keyof T>(
		type: K,
		node?: Partial<
			Omit<NodeProps & ComponentProps<T[K]>["node"], "id" | "type">
		>
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
				setNode: (id, data) =>
					set((state) => {
						if (!state.nodes || !Boolean(state.nodes.length)) {
							return state;
						}

						const nodes = state.nodes.map((node) => {
							if (node.id === id) {
								return { ...node, ...data };
							}
							return node;
						});

						return { nodes };
					}),
				setNodes: (nodes) => set({ nodes }),
				removeNode: (id) =>
					set((state) => {
						if (!state.nodes || !Boolean(state.nodes.length)) {
							return state;
						}

						const nodes = state.nodes?.filter((node) => node.id !== id);
						return { nodes };
					}),
				addNode: (type, node) =>
					set((state) => {
						// Clone to force a re-render
						const nodes = [...(state.nodes ?? [])];

						nodes.push({
							...node,
							id: uuid4(),
							position: { x: 0, y: 0 },
							type,
						} as NodeProps); // NOTE: I would like to find a way to remove the 'as NodeProps'

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
