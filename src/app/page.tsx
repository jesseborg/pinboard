"use client";

import { Background, PinBoard } from "@/components/pinboard";
import { useNodes } from "@/hooks/use-nodes";

export default function Home() {
	const { nodes, setNodes } = useNodes();

	return (
		<main>
			<PinBoard nodes={nodes} onNodesChange={setNodes}>
				<Background />
			</PinBoard>
		</main>
	);
}
