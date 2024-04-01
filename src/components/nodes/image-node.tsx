import {
	FormEvent,
	MouseEvent,
	PropsWithChildren,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Button } from "../button";
import { CustomNodeProps, NodeProps } from "../pinboard/types";
import { BaseNode } from "./base-node";

export type ImageNodeProps = NodeProps & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export function ImageNode({ node }: CustomNodeProps<ImageNodeProps>) {
	const [editing, setEditing] = useState(false);

	function handleEdit() {
		setEditing(true);
	}

	return (
		<>
			<BaseNode node={node} handleEdit={handleEdit}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={node.data.src} alt={node.data.alt} />
			</BaseNode>

			{editing && (
				<EditDialog open onClose={() => setEditing(false)}>
					<div className="p-2">
						<p>{node.id}</p>
						<form method="dialog">
							<Button>Save</Button>
						</form>
					</div>
				</EditDialog>
			)}
		</>
	);
}

type DialogProps = {
	open?: boolean;
	onClose?: () => void;
};

function EditDialog({
	open = false,
	onClose,
	children,
}: PropsWithChildren<DialogProps>) {
	const ref = useRef<HTMLDialogElement>(null);

	useLayoutEffect(() => {
		ref.current?.showModal();
	}, []);

	function handleOnClick(event: MouseEvent<HTMLDialogElement>) {
		if (event.target === ref.current) {
			ref.current?.close();
			onClose?.();
		}
	}

	function handleSubmit(event: FormEvent<HTMLDialogElement>) {
		event.preventDefault();
	}

	return (
		<dialog
			ref={ref}
			onClick={handleOnClick}
			onSubmit={handleSubmit}
			className="rounded-md bg-white shadow-3xl backdrop:bg-black/50 pointer-events-auto"
		>
			{children}
		</dialog>
	);
}
