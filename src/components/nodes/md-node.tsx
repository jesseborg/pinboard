import useDebounce from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useNodesActions } from "@/stores/use-nodes-store";
import { memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CustomNodeProps, NodeProps } from "../pinboard/types";
import { BaseNode } from "./base-node";

export type MDXNodeProps = NodeProps & {
	type: "mdx";
	data: {
		label: string;
	};
};

export function BaseMDNode({ node, handleRef }: CustomNodeProps<MDXNodeProps>) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const { setNode } = useNodesActions();

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
		textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
	}

	const debounceUpdateNode = useDebounce((data: MDXNodeProps["data"]) => {
		console.log("updated node");
		setNode<MDXNodeProps>(node.id, { data });
	}, 300);

	function handleInput() {
		autoResize();
		debounceUpdateNode({ label: textareaRef.current?.value });
	}

	function handleBlur() {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(textareaRef.current)) {
			window.getSelection()?.empty();
		}
	}

	// Sometimes the textarea height is incorrect on first render
	useEffect(() => {
		const timeout = setTimeout(() => {
			autoResize();
		}, 50);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<BaseNode node={node} className="p-2 min-h-[250px] w-[250px] text-sm">
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
				defaultValue={node.data.label ?? ""}
				placeholder="Type anything..."
				onInput={handleInput}
				onBlur={handleBlur}
			/>
		</BaseNode>
	);
}

export const MDNode = memo(BaseMDNode);
