import { cn } from "@/lib/utils";
import { Node, useSelectedNodeId } from "@/stores/use-nodes-store";
import { HTMLAttributes, PropsWithChildren } from "react";

type BaseNodeProps = {
	node: Node;
};

export function BaseNode({
	node,
	className,
	children,
}: PropsWithChildren<BaseNodeProps & HTMLAttributes<HTMLDivElement>>) {
	const selectedNodeId = useSelectedNodeId();

	const selected = node?.id === selectedNodeId;

	return (
		<div
			className={cn(
				"border-2 border-black bg-white shadow-[2px_2px] shadow-black",
				className,
				{
					"outline outline-2 outline-blue-500": selected,
				}
			)}
		>
			{children}
		</div>
	);
}
