import { Node } from "@/components/node";
import { Background, PinBoard } from "@/components/pinboard";

// const nodes: Array<Node> = [
// 	{
// 		id: "1",
// 		position: { x: 0, y: 0 },
// 		type: "text",
// 		data: {
// 			label: "Hello World",
// 		},
// 	},
// 	{
// 		id: "2",
// 		position: { x: 0, y: 0 },
// 		type: "text",
// 		data: {
// 			label: "Hello World",
// 		},
// 	},
// ];

const nodes = new Array(2).fill(0).map(
	(_, i) =>
		({
			id: `${i}`,
			position: { x: 0, y: 0 },
			type: "text",
			data: {
				label: `Hello World (${i})`,
			},
		} as Node)
);

console.log(nodes);

export default function Home() {
	return (
		<main>
			<PinBoard nodes={nodes}>
				<Background />
			</PinBoard>
		</main>
	);
}
