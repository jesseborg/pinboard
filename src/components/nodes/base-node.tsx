import { useKeyDown } from "@/hooks/use-keydown";
import { cn } from "@/lib/utils";
import {
	Node,
	useNodesActions,
	useSelectedNodeId,
} from "@/stores/use-nodes-store";
import { HTMLAttributes, PropsWithChildren, useRef } from "react";
import { Button } from "../primitives/button";

type BaseNodeProps = {
	node: Node;
	handleEdit?: () => void;
};

export function BaseNode({
	node,
	handleEdit,
	className,
	children,
}: PropsWithChildren<BaseNodeProps & HTMLAttributes<HTMLDivElement>>) {
	const selectedNodeId = useSelectedNodeId();

	const selected = node?.id === selectedNodeId;

	return (
		<>
			<div
				className={cn(
					"border-2 border-black bg-white relative shadow-[2px_2px] shadow-black z-0",
					className,
					{
						"outline outline-2 outline-blue-500 z-50": selected,
					}
				)}
			>
				{children}
			</div>
			{selected && <NodeToolBar node={node} handleEdit={handleEdit} />}
		</>
	);
}

type NodeToolBarProps = {
	node: Node;
	handleEdit?: () => void;
};
function NodeToolBar({ node, handleEdit }: NodeToolBarProps) {
	const { removeNode } = useNodesActions();

	const ref = useRef<HTMLDivElement | null>(null);

	useKeyDown(
		ref,
		["ArrowLeft", "ArrowRight"],
		(key) => {
			const children = Array.from(ref.current?.childNodes ?? []).filter(
				isButton
			);
			const index = children.indexOf(
				document.activeElement! as HTMLButtonElement
			);

			if (key === "ArrowLeft") {
				children.at(-(index + 1))?.focus();
			}

			if (key === "ArrowRight") {
				children.at(index - 1)?.focus();
			}
		},
		null,
		[ref]
	);

	return (
		<div
			ref={ref}
			className="text-xs absolute top-full left-1/2 -translate-x-1/2 flex gap-1.5 bg-black p-1.5 rounded-md text-white mt-2 pointer-events-auto"
		>
			<Button
				intent="primary"
				size="xs"
				className="p-1 px-2"
				onClick={() => handleEdit?.()}
			>
				Edit
			</Button>
			<span className="bg-white w-px my-1 mr-px" />
			<Button
				intent="primary"
				size="xs"
				className="p-1 px-2"
				onClick={() => removeNode(node.id)}
			>
				Delete
			</Button>
		</div>
	);
}

function isButton(element: any): element is HTMLButtonElement {
	return element.localName === "button";
}
