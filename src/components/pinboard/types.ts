export type Point = {
	x: number;
	y: number;
};

export type Size = {
	width: number;
	height: number;
};

export type NodeProps<T = string, D = Record<string, unknown>> = {
	id: string;
	index: number;
	position: Point;
	size: Size;
	type: T;
	data: D | null;
};

export type CustomNodeProps<T, D> = {
	node: NodeProps<T, D>;
	handleRef: React.Ref<NodeHandle>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeTypes<T = any, D = any> = Record<
	string,
	React.ComponentType<CustomNodeProps<T, D>>
>;

export type NodeHandle = {
	onDoubleClick: () => void;
};
