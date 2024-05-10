import { setupIndexedDB } from "@/hooks/use-indexed-db";
import { useKeyDown } from "@/hooks/use-keydown";
import { useNodes, useNodesActions } from "@/stores/use-nodes-store";
import { useEffect, useState } from "react";
import { ImageNode } from "./components/nodes/image-node";
import { NoteNode } from "./components/nodes/note-node";
import { Background } from "./components/pinboard/background";
import { Controls } from "./components/pinboard/controls";
import { PinBoard } from "./components/pinboard/pinboard";
import { ToolBar } from "./components/toolbar";

export const nodeTypes = {
	note: NoteNode,
	image: ImageNode,
};

export function App() {
	const nodes = useNodes();
	const { addNode } = useNodesActions<typeof nodeTypes>();

	const [loading, setLoading] = useState(true);

	useKeyDown(
		document.body,
		["n", "i"],
		({ key }) => {
			if (key === "n") {
				addNode("note");
				return;
			}

			if (key === "i") {
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
		<main>
			<PinBoard nodes={nodes} nodeTypes={nodeTypes}>
				<ToolBar />
				<Controls />
				<Background />
			</PinBoard>
		</main>
	);
}
