"use client";

import { useNodes, useNodesActions } from "@/stores/use-nodes-store";
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
	const nodes = useNodes();
	const { setNodes } = useNodesActions();

	return (
		<PinBoard nodes={nodes} onNodesChange={setNodes} nodeTypes={nodeTypes}>
			<ToolBar />
			<Background />
		</PinBoard>
	);
}

function ToolBar() {
	const { addNode } = useNodesActions<typeof nodeTypes>();

	return (
		<div className="absolute z-20 text-white h-full pl-6 flex">
			<div className="flex self-center gap-1.5 flex-col bg-black p-1.5 rounded-md">
				<Button onClick={() => addNode("mdx", { data: { label: "" } })}>
					<NoteIcon />
				</Button>
				<Button
					onClick={() =>
						addNode("image", {
							data: {
								src: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=240",
								alt: "photo of a cat yawning",
							},
						})
					}
				>
					<ImageIcon />
				</Button>
			</div>
		</div>
	);
}
