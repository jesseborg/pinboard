import { ComponentType, Ref } from "react";

export type Point = {
	x: number;
	y: number;
};

export type NodeProps = {
	id: string;
	position: Point;
	type: string;
	data: Record<string, unknown>;
};

export type NodeTypes<T extends NodeProps = any> = Record<
	string,
	ComponentType<CustomNodeProps<T>>
>;

export type CustomNodeProps<T extends NodeProps> = {
	node: T;
	handleRef: Ref<NodeHandle>;
};

export type NodeHandle = {
	onDoubleClick: () => void;
};
