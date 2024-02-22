"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { Node } from "./node";
import { Background, PinBoard } from "./pinboard";

export function App() {
	const [nodes, setNodes] = useLocalStorage<Array<Node>>("nodes");

	return (
		<main>
			<PinBoard nodes={nodes} onNodesChange={setNodes}>
				<Background />
			</PinBoard>
		</main>
	);
}
