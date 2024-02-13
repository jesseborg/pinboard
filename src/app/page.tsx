import { Node } from "@/components/node";
import { Background, PinBoard } from "@/components/pinboard";

const nodes: Array<Node> = [
	{
		id: "1",
		position: { x: 0, y: 0 },
		type: "text",
		data: {
			label: "Hello World",
		},
	},
	{
		id: "2",
		position: { x: 0, y: 0 },
		type: "text",
		data: {
			label: "Hello World",
		},
	},
];

export default function Home() {
	return (
		<main>
			<PinBoard nodes={nodes}>
				<Background />
			</PinBoard>
		</main>
	);
}
