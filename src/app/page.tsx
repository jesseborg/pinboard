import { Background, PinBoard } from "@/components/pinboard";

export default function Home() {
	return (
		<main>
			<PinBoard nodes={["Hello, World"]}>
				<Background />
			</PinBoard>
		</main>
	);
}
