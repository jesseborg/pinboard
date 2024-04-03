import useDebounce from "@/hooks/use-debounce";
import { Node, useNodesActions } from "@/stores/use-nodes-store";
import { ChangeEvent, FormEvent, KeyboardEvent, useRef, useState } from "react";
import { CloudUploadIcon } from "../icons/cloud-upload-icon";
import { CustomNodeProps, NodeProps } from "../pinboard/types";
import { Button } from "../primitives/button";
import { Dialog } from "../primitives/dialog";
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

			{editing && <EditDialog node={node} onClose={() => setEditing(false)} />}
		</>
	);
}

type EditDialogProps = {
	node: Node;
	onClose?: () => void;
};
function EditDialog({ node, onClose }: EditDialogProps) {
	const { setNode } = useNodesActions();

	const [value, setValue] = useState<string | null>(null);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		setNode<ImageNodeProps>(node.id, { data: { src: value!, alt: "" } });
	}

	function handleResetForm() {
		setValue(null);
	}

	const hasImage = value !== null;

	return (
		<Dialog
			onClose={() => onClose?.()}
			className="rounded-md bg-white shadow-3xl backdrop:bg-black/50 pointer-events-auto"
		>
			<form
				method="dialog"
				onSubmit={handleSubmit}
				className="p-4 text-xs bg-white space-y-4 w-80"
			>
				{!hasImage && (
					<>
						<ImageUploadInput onChange={setValue} />
						<p className="text-center">or</p>
						<ImageURLInput onChange={setValue} />
					</>
				)}

				{hasImage && (
					<div className="space-y-2">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className="rounded-md mx-auto bg-red-500"
							src={value}
							alt="image"
						/>
						<div className="flex gap-2">
							<Button
								formMethod="dialog"
								type="submit"
								size="xs"
								className="w-full"
							>
								Submit
							</Button>
							<Button
								type="reset"
								intent="blank"
								size="xs"
								className="w-full"
								onClick={handleResetForm}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</form>
		</Dialog>
	);
}

type ImageUploadInputProps = {
	onChange?: (value: string) => void;
};
function ImageUploadInput({ onChange }: ImageUploadInputProps) {
	const fileRef = useRef<HTMLInputElement | null>(null);

	function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (event.key === " " || event.key === "Enter") {
			fileRef.current?.click();
		}
	}

	function handleClick() {
		fileRef.current?.click();
	}

	function handleFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		// convert file to base64 string
		const reader = new FileReader();
		reader.addEventListener(
			"load",
			() => {
				const result = reader.result?.toString();

				if (!result) {
					return;
				}

				onChange?.(result);
			},
			false
		);
		reader.readAsDataURL(file);
	}

	return (
		<div
			tabIndex={0}
			className="flex items-center flex-col mx-auto p-2 py-8 cursor-pointer rounded-md outline-2 focus:outline bg-neutral-100"
			onKeyDown={handleKeyDown}
			onClick={handleClick}
		>
			<input
				hidden
				aria-hidden
				ref={fileRef}
				type="file"
				accept="image/png"
				className="w-fit"
				onChange={handleFile}
			/>
			<CloudUploadIcon />
			<p>Upload Image</p>
		</div>
	);
}

type ImageURLInputProps = {
	onChange?: (url: string) => void;
};
function ImageURLInput({ onChange }: ImageURLInputProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleBadResponse(e: typeof error = null) {
		setError(e);
		setLoading(false);
	}

	const debounceUpdateURL = useDebounce(async (value: string) => {
		try {
			const response = await fetch(value);

			if (!response.ok) {
				handleBadResponse();
				return;
			}

			const contentType = response.headers.get("content-type");
			if (!contentType?.startsWith("image/")) {
				handleBadResponse();
				return;
			}

			// const blob = URL.createObjectURL(await response.blob());
			onChange?.(value);
			setError(null);
		} catch (error) {
			handleBadResponse("Invalid image URL");
		}

		setLoading(false);
	}, 500);

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		setLoading(true);
		setError(null);
		debounceUpdateURL(event.target.value);
	}

	return (
		<>
			<input
				id="image"
				name="image"
				className="p-2 mb-1 w-full bg-white text-black rounded-md border-neutral-200 border focus:outline-black"
				placeholder="Enter an image URL..."
				onChange={handleChange}
			/>
			{loading && <p>Loading...</p>}
			{Boolean(error) && <p>{error}</p>}
		</>
	);
}
