import { cn } from "@/lib/utils";
import { useNodes, useNodesActions } from "@/stores/use-nodes-store";
import {
	FormEvent,
	memo,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { CustomNode, NodeProps } from "../pinboard/types";
import { BaseNode } from "./base-node";

export type MDXNode = NodeProps<{
	type: "mdx";
	data: {
		label: string;
	};
}>;

export function MDXNodee({ node, handleRef }: CustomNode<MDXNode>) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const nodes = useNodes();
	const { setNodes } = useNodesActions();

	const [editing, setEditing] = useState(false);

	useImperativeHandle(
		handleRef,
		() => {
			return {
				onDoubleClick: () => {
					textareaRef.current?.focus();
					setEditing(true);
				},
			};
		},
		[]
	);

	function autoResize() {
		if (!textareaRef.current) {
			return;
		}

		textareaRef.current.style.height = "auto";
		textareaRef.current.style.height =
			textareaRef.current.scrollHeight + 2 + "px"; // 2px to account for padding
	}

	function handleInput(_: FormEvent<HTMLTextAreaElement>) {
		autoResize();

		if (!nodes || !node || !textareaRef.current) {
			return;
		}

		(nodes[node.id] as MDXNode).data.label = textareaRef.current?.value;
		setNodes?.(nodes);
	}

	function handleBlur() {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(textareaRef.current)) {
			window.getSelection()?.empty();
		}
	}

	useEffect(() => {
		autoResize();
	}, []);

	return (
		<BaseNode className="p-2 min-h-[250px] w-[250px] text-sm">
			<textarea
				ref={textareaRef}
				autoComplete="off"
				autoCapitalize="off"
				autoCorrect="off"
				readOnly={!editing}
				spellCheck={editing}
				className={cn(
					"outline-none resize-none bg-transparent overflow-hidden w-full",
					{
						"pointer-events-auto": editing,
					}
				)}
				cols={25}
				defaultValue={node.data.label}
				placeholder="Type anything..."
				onInput={handleInput}
				onBlur={handleBlur}
			/>
		</BaseNode>
	);
}

export const MDXNode = memo(MDXNodee);
