"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { ImageNode } from "./nodes/image-node";
import { MDXNode } from "./nodes/mdx-node";
import { type Node } from "./nodes/types";
import { Background } from "./pinboard/background";
import { PinBoard } from "./pinboard/pinboard";

const nodeTypes = {
	mdx: MDXNode,
	image: ImageNode,
};

export function App() {
	const [nodes, setNodes] = useLocalStorage<Array<Node> | null>("nodes");

	return (
		<PinBoard nodes={nodes} onNodesChange={setNodes} nodeTypes={nodeTypes}>
			<Background />
		</PinBoard>
	);
}
