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

export type CustomNodeProps<
	T extends string,
	D extends Record<string, unknown>
> = {
	node: NodeProps<T, D>;
	handleRef: React.Ref<NodeHandle>;
};

export type NodeTypes = Record<
	string,
	React.ComponentType<CustomNodeProps<any, any>>
>;

export type NodeHandle = {
	onDoubleClick: () => void;
};
