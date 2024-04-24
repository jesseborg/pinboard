"use client";

import { setupIndexedDB } from "@/hooks/use-indexed-db";
import { useKeyDown } from "@/hooks/use-keydown";
import { useNodes, useNodesActions } from "@/stores/use-nodes-store";
import { useEffect, useState } from "react";
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

	const [loading, setLoading] = useState(true);

	useKeyDown(
		{ current: typeof document !== "undefined" ? document.body : null },
		["n", "i"],
		(keys) => {
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

	useEffect(() => {
		async function setupDB() {
			await setupIndexedDB({
				name: "nodes",
				version: 1,
				stores: [
					{
						name: "images",
						indices: [
							{ name: "blob", keyPath: "blob", options: { unique: false } },
						],
					},
				],
			});
			setLoading(false);
		}
		setupDB();
	}, []);

	if (loading) {
		return null;
	}

	return (
		<PinBoard nodes={nodes} onNodesChange={setNodes} nodeTypes={nodeTypes}>
			<ToolBar />
			<Background />
		</PinBoard>
	);
}
