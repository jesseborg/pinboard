import { useKeyDown } from "@/hooks/use-keydown";
import { cn, sleep } from "@/lib/utils";
import { useNodesActions } from "@/stores/use-nodes-store";
import {
	ChangeEvent,
	memo,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { CustomNodeProps } from "../pinboard/types";
import { BaseNode } from "./base-node";

const DEFAULT_SIZE = 250;
const PADDING = 8;

type NoteNodeType = CustomNodeProps<
	"note",
	{
		label: string;
	}
>;
type NoteNodeProps = NoteNodeType["node"];

export function BaseNoteNode({ node, handleRef }: NoteNodeType) {
	const { setNode } = useNodesActions();

	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const [editing, setEditing] = useState(false);

	async function handleEdit() {
		setEditing(true);

		// when calling this function from BaseNode
		// React refuses to update the 'editing' state, unless I wait
		await sleep(10);
		textAreaRef.current?.focus();
	}

	function handleChange(event: ChangeEvent<typeof textAreaRef.current>) {
		setNode<NoteNodeProps>(node.id, {
			data: { label: event.target.value },
		});
	}

	function handleBlur() {
		setEditing(false);

		// If the user selected text, empty the selection so it's not always visible
		if (window.getSelection()?.focusNode?.contains(textAreaRef.current)) {
			window.getSelection()?.empty();
		}

		document.getElementById(node.id)?.focus();
	}

	function resizeTextArea() {
		if (!textAreaRef.current) {
			return;
		}

		textAreaRef.current.style.height = `${DEFAULT_SIZE}px`;
		textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;

		// Only updating the height at the moment, because width is fixed for now
		setNode<NoteNodeProps>(node.id, {
			size: {
				width: DEFAULT_SIZE,
				height: Math.max(
					textAreaRef.current.scrollHeight + PADDING * 2,
					DEFAULT_SIZE
				),
			},
		});
	}

	// Forward the double click event from handleRef
	useImperativeHandle(handleRef, () => ({ onDoubleClick: handleEdit }), []);

	// Resize the textarea to match content
	useEffect(resizeTextArea, [node.data?.label]);

	useEffect(() => {
		const timeout = setTimeout(resizeTextArea, 100);
		return () => clearTimeout(timeout);
	}, []);

	// Exit the textarea when escape pressed
	useKeyDown(textAreaRef, "Escape", () => handleBlur());

	return (
		<BaseNode
			node={node}
			handleEdit={handleEdit}
			style={{
				width: node.size?.width,
				height: node.size?.height,
				padding: PADDING,
			}}
			className="text-sm min-w-[250px]"
		>
			<textarea
				ref={textAreaRef}
				tabIndex={-1}
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
				value={node.data?.label}
				placeholder="Type anything..."
				onChange={handleChange}
				onBlur={handleBlur}
			/>
		</BaseNode>
	);
}

export const NoteNode = memo(BaseNoteNode);
