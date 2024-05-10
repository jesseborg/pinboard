import { cn } from "@/lib/utils";
import { usePinBoardTransform } from "@/stores/use-pinboard-store";

type Position = "top" | "middle" | "bottom";
type Axis = "left" | "center" | "right";

type ControlsProps = {
	position?: `${Position}-${Axis}`;
};

export function Controls({ position = "bottom-right" }: ControlsProps) {
	const transform = usePinBoardTransform();

	return (
		<div className={cn("absolute", position)}>
			<p className={cn("bg-black text-white p-2 text-sm rounded-md m-2")}>
				{Math.round(transform.scale * 100)}%
			</p>
		</div>
	);
}
