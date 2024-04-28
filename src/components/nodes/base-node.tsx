import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useKeyDown } from "@/hooks/use-keydown";
import { cn } from "@/lib/utils";
import {
	Node,
	useNodesActions,
	useSelectedNodeId,
} from "@/stores/use-nodes-store";
import { usePinBoardTransform } from "@/stores/use-pinboard-store";
import { HTMLAttributes, PropsWithChildren, useEffect, useMemo } from "react";
import { Button } from "../primitives/button";
import { Portal } from "../primitives/portal";

type BaseNodeProps = {
	node: Node;
	handleEdit?: () => void;
};

const OUTLINE_WIDTH = 4.5;

export function BaseNode({
	node,
	handleEdit,
	className,
	children,
}: PropsWithChildren<BaseNodeProps & HTMLAttributes<HTMLDivElement>>) {
	const transform = usePinBoardTransform();
	const selectedNodeId = useSelectedNodeId();
	const { setNode } = useNodesActions();

	const selected = node?.id === selectedNodeId;

	useEffect(() => {
		const element = document.getElementById(node.id);

		if (!element) {
			return;
		}

		setNode(node.id, {
			size: { width: element.clientWidth, height: element.clientHeight },
		});
	}, []);

	return (
		<>
			<div
				style={{
					outlineWidth: Math.max(
						OUTLINE_WIDTH,
						OUTLINE_WIDTH / transform.scale
					),
				}}
				className={cn(
					"ring-2 ring-black bg-white relative shadow-[2px_2px_0_2px] shadow-black z-0",
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

const TOOLBAR_PADDING = 8;

type NodeToolBarProps = {
	node: Node;
	handleEdit?: () => void;
};
function NodeToolBar({ node, handleEdit }: NodeToolBarProps) {
	const transform = usePinBoardTransform();
	const { removeNode } = useNodesActions();
	const { deleteById } = useIndexedDB<Blob>("images");

	useKeyDown(
		"#node-toolbar",
		["ArrowLeft", "ArrowRight"],
		({ key, element }) => {
			const children = Array.from(element.childNodes ?? []).filter(isButton);
			const index = children.indexOf(
				document.activeElement! as HTMLButtonElement
			);

			if (key === "ArrowLeft") {
				children.at(-(index + 1))?.focus();
			}

			if (key === "ArrowRight") {
				children.at(index - 1)?.focus();
			}
		}
	);

	async function handleDeleteClick() {
		deleteById(node.id);
		removeNode(node.id);
	}

	const pos = useMemo(
		() => ({
			// prettier-ignore
			x: transform.x + (node.position.x * transform.scale) + (node.size.width * transform.scale) / 2,
			// prettier-ignore
			y: (transform.y + (node.position.y * transform.scale) + node.size.height * transform.scale) + TOOLBAR_PADDING,
		}),
		[transform, node]
	);

	return (
		<Portal asChild>
			<div
				id="node-toolbar"
				style={{
					transform: `translate(calc(${pos.x}px - 50%),${pos.y}px)`,
				}}
				className="text-xs z-50 absolute flex top-0 left-0 gap-1.5 bg-black p-1.5 rounded-md text-white pointer-events-auto"
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
					onClick={handleDeleteClick}
				>
					Delete
				</Button>
			</div>
		</Portal>
	);
}

function isButton(element: any): element is HTMLButtonElement {
	return element.localName === "button";
}
