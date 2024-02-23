"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { ImageNode, MDXNode, Node } from "./node";
import { Background } from "./pinboard/background";
import { PinBoard } from "./pinboard/pinboard";

const nodeTypes = {
	mdx: MDXNode,
	image: ImageNode,
};

export function App() {
	const [nodes, setNodes] = useLocalStorage<Array<Node>>("nodes");

	return (
		<PinBoard nodes={nodes} onNodesChange={setNodes} nodeTypes={nodeTypes}>
			<Background />
		</PinBoard>
	);
}
