import { ComponentType, Ref } from "react";

export type Point = {
	x: number;
	y: number;
};
export type Size = {
	width: number;
	height: number;
};

export type NodeProps<T extends string, D extends Record<string, unknown>> = {
	id: string;
	index: number;
	position: Point;
	size: Size;
	type: T;
	data: D | null;
};

export type NodeTypes<
	T extends NodeProps<string, any> = NodeProps<string, any>
> = Record<string, ComponentType<CustomNodeProps<T>>>;

export type CustomNodeProps<T extends NodeProps<string, any>> = {
	node: T;
	handleRef: Ref<NodeHandle>;
};

export type NodeHandle = {
	onDoubleClick: () => void;
};
