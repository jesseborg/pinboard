import { cn } from "@/lib/utils";
import { FormEvent, useImperativeHandle, useRef, useState } from "react";
import { CustomNode, NodeProps } from "../pinboard/pinboard";
import { BaseNode } from "./base-node";

export type MDXNode = NodeProps<{
	type: "mdx";
	data: {
		label: string;
	};
}>;

export function MDXNode({ node, handleRef }: CustomNode<MDXNode>) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [editing, setEditing] = useState(false);

	useImperativeHandle(
		handleRef,
		() => {
			return {
				handleDoubleClick: () => {
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
	}

	function handleBlur() {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(textareaRef.current)) {
			window.getSelection()?.empty();
		}
	}

	return (
		<BaseNode className="min-h-[250px] w-[250px]">
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
				rows={1}
				defaultValue={node.data.label}
				placeholder="Type anything..."
				onInput={handleInput}
				onBlur={handleBlur}
			/>
		</BaseNode>
	);
}
