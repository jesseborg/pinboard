"use client";

import { useKeyDown } from "@/hooks/use-keydown";
import { useNodes, useNodesActions } from "@/stores/use-nodes-store";
import { ImageNode } from "./nodes/image-node";
import { NoteNode } from "./nodes/note-node";
import { Background } from "./pinboard/background";
import { PinBoard } from "./pinboard/pinboard";
import { ToolBar } from "./toolbar";

export const nodeTypes = {
	note: NoteNode,
	image: ImageNode,
};

export function App() {
	const nodes = useNodes();
	const { setNodes, addNode } = useNodesActions<typeof nodeTypes>();

	useKeyDown(
		{ current: typeof document !== "undefined" ? document.body : null },
		["n", "i"],
		async (keys) => {
			if (keys === "n") {
				addNode("note");
				return;
			}

			if (keys === "i") {
				addNode("image");
				return;
			}
		},
		{ ignoreWhileInput: true }
	);

	return (
		<PinBoard nodes={nodes} onNodesChange={setNodes} nodeTypes={nodeTypes}>
			<ToolBar />
			<Background />
		</PinBoard>
	);
}
