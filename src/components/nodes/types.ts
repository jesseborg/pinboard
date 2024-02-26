import { ImageNode } from "./image-node";
import { MDXNode } from "./mdx-node";

export type Node = MDXNode | ImageNode;

export type NodeHandle = {
	handleDoubleClick: () => void;
};
