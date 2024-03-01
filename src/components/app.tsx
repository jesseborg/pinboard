"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { Nodes } from "@/stores/use-nodes-store";
import { Button } from "./button";
import { ImageIcon } from "./icons/image-icon";
import { NoteIcon } from "./icons/note-icon";
import { ImageNode } from "./nodes/image-node";
import { MDXNode } from "./nodes/mdx-node";
import { Background } from "./pinboard/background";
import { PinBoard } from "./pinboard/pinboard";

const nodeTypes = {
	mdx: MDXNode,
	image: ImageNode,
};

export function App() {
	const [nodes, setNodes] = useLocalStorage<Nodes | null>("nodes");

	return (
		<PinBoard nodes={nodes} onNodesChange={setNodes} nodeTypes={nodeTypes}>
			<ToolBar />
			<Background />
		</PinBoard>
	);
}

function ToolBar() {
	return (
		<div className="absolute z-20 text-white h-full pl-6 flex">
			<div className="flex self-center gap-1.5 flex-col bg-black p-1.5 rounded-md">
				<Button>
					<NoteIcon />
				</Button>
				<Button>
					<ImageIcon />
				</Button>
			</div>
		</div>
	);
}
