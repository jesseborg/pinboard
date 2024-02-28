import { ComponentType, Ref } from "react";
import { NodeHandle } from "../nodes/types";

export type Point = {
	x: number;
	y: number;
};

export type NodeProps<T = {}> = {
	id: number;
	position: Point;
	type: string;
} & T;

export type NodeTypes<T extends NodeProps = any> = Record<
	string,
	ComponentType<CustomNode<T>>
>;

export type CustomNode<T extends NodeProps> = {
	node: T;
	handleRef: Ref<NodeHandle>;
};
