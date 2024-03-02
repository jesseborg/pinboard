import { ComponentType, Ref } from "react";

export type Point = {
	x: number;
	y: number;
};

export type NodeProps = {
	id: number;
	position: Point;
	type: string;
};

export type NodeTypes = Record<string, ComponentType<CustomNodeProps<any>>>;

export type CustomNodeProps<T extends NodeProps> = {
	node: T;
	handleRef: Ref<NodeHandle>;
};

export type NodeHandle = {
	onDoubleClick: () => void;
};
