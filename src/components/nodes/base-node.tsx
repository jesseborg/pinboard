import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useKeyDown } from "@/hooks/use-keydown";
import { cn } from "@/lib/utils";
import { useNodesActions, useSelectedNodeId } from "@/stores/use-nodes-store";
import { usePinBoardTransform } from "@/stores/use-pinboard-store";
import {
	HTMLAttributes,
	PropsWithChildren,
	useLayoutEffect,
	useState,
} from "react";
import { NodeProps, Point } from "../pinboard/types";
import { Button } from "../primitives/button";
import { Portal } from "../primitives/portal";

type BaseNodeProps = {
	node: NodeProps<any, any>;
	handleEdit?: () => void;
};

const OUTLINE_WIDTH = 4.5;

export function BaseNode({
	node,
	handleEdit,
	className,
	children,
	style,
	...props
}: PropsWithChildren<BaseNodeProps & HTMLAttributes<HTMLDivElement>>) {
	const transform = usePinBoardTransform();
	const selectedNodeId = useSelectedNodeId();

	const selected = node?.id === selectedNodeId;

	return (
		<>
			<div
				style={{
					outlineWidth: Math.max(
						OUTLINE_WIDTH,
						OUTLINE_WIDTH / transform.scale
					),
					...style,
				}}
				className={cn(
					"ring-2 ring-black bg-white relative shadow-[2px_2px_0_2px] shadow-black z-0",
					className,
					{
						"outline outline-2 outline-blue-500 z-40": selected,
					}
				)}
				{...props}
			>
				{children}
			</div>
			{selected && <NodeToolBar node={node} handleEdit={handleEdit} />}
		</>
	);
}

const TOOLBAR_PADDING = 8;

function NodeToolBar({ node, handleEdit }: BaseNodeProps) {
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

	const [position, setPosition] = useState<Point | null>(null);

	useLayoutEffect(() => {
		const element = document.getElementById(node.id);

		if (!element) {
			return;
		}

		setPosition({
			x:
				transform.x +
				(node.position.x + element.clientWidth / 2) * transform.scale,
			y:
				transform.y +
				(node.position.y + element.clientHeight) * transform.scale +
				TOOLBAR_PADDING,
		});
	}, [transform, node.position, node.size, node.data]);

	if (!position) {
		return null;
	}

	return (
		<Portal asChild>
			<div
				id="node-toolbar"
				style={{
					transform: `translate(calc(${position.x}px - 50%),${position.y}px)`,
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
