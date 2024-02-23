import { cn } from "@/lib/utils";
import {
	HTMLAttributes,
	forwardRef,
	memo,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

export type Point = {
	x: number;
	y: number;
};

export type BaseNode = {
	id: string;
	position: Point;
};

export type MDXNode = BaseNode & {
	type: "mdx";
	data: {
		label: string;
	};
};

export type ImageNode = BaseNode & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export type Node = MDXNode | ImageNode;

export type NodeHandle = {
	handleDoubleClick: () => void;
};

const MDXNode = forwardRef<NodeHandle, MDXNode>((node, ref) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [editing, setEditing] = useState(false);

	useImperativeHandle(
		ref,
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

	function handleInput() {
		autoResize();
	}

	function handleBlur() {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(textareaRef.current)) {
			window.getSelection()?.empty();
		}
	}

	return (
		<div>
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
		</div>
	);
});
MDXNode.displayName = "MDXNode";

const ImageNode = forwardRef<NodeHandle, ImageNode>((node) => {
	// eslint-disable-next-line @next/next/no-img-element
	return <img src={node.data.src} alt={node.data.alt} />;
});
ImageNode.displayName = "ImageNode";

const NodeRenderer = memo(
	forwardRef<NodeHandle, Node>((node, ref) => {
		switch (node.type) {
			case "mdx":
				return <MDXNode ref={ref} {...node} />;
			case "image":
				return <ImageNode ref={ref} {...node} />;
			default:
				return null;
		}
	})
);
NodeRenderer.displayName = "NodeRenderer";

type NodeProps = { node: Node } & HTMLAttributes<HTMLDivElement>;
export function Node({ node, className, ...props }: NodeProps) {
	const nodeRef = useRef<NodeHandle>(null);

	function handleDoubleClick() {
		nodeRef.current?.handleDoubleClick();
	}

	return (
		<div
			{...props}
			id={node.id}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
			}}
			className={cn(
				"pointer-events-auto border-2 border-black p-2 bg-white shadow-[2px_2px] shadow-black size-[250px]",
				className
			)}
			onDoubleClick={handleDoubleClick}
		>
			<NodeRenderer ref={nodeRef} {...node} />
		</div>
	);
}
