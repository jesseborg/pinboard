import useDebounce from "@/hooks/use-debounce";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { preloadImage } from "@/lib/utils";
import { useNodesActions } from "@/stores/use-nodes-store";
import {
	ChangeEvent,
	FormEvent,
	KeyboardEvent,
	memo,
	useEffect,
	useRef,
	useState,
} from "react";
import { CloudUploadIcon } from "../icons/cloud-upload-icon";
import { ImageIcon } from "../icons/image-icon";
import { CustomNodeProps, NodeProps } from "../pinboard/types";
import { Button } from "../primitives/button";
import { Dialog, DialogProps } from "../primitives/dialog";
import { Portal } from "../primitives/portal";
import { BaseNode } from "./base-node";

export type ImageNodeProps = NodeProps & {
	type: "image";
	data: {
		src: string;
		alt?: string;
	};
};

export function BaseImageNode({ node }: CustomNodeProps<ImageNodeProps>) {
	const { removeNode } = useNodesActions();

	const [editing, setEditing] = useState(!node.data);

	function handleDialogClose(_: FormEvent, submit?: boolean) {
		setEditing(false);

		if (!submit && !node.data) {
			removeNode(node.id);
		}
	}

	return (
		<>
			<BaseNode node={node} handleEdit={() => setEditing(true)}>
				<Image node={node} />
			</BaseNode>

			{editing && <EditDialog node={node} onClose={handleDialogClose} />}
		</>
	);
}
export const ImageNode = memo(BaseImageNode);

function Image({ node }: { node: ImageNodeProps }) {
	const { getById } = useIndexedDB<Blob>("images");

	const [blobURL, setBlobURL] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (!node.data) {
			return;
		}

		getById(node.id).then((blob) => {
			setBlobURL(URL.createObjectURL(blob));
		});
	}, [getById, node.id, node.data]);

	if (!node.data) {
		return (
			<div className="size-64 flex items-center justify-center">
				<ImageIcon className="w-12 h-12" />
			</div>
		);
	}

	return (
		<img
			src={blobURL}
			alt={node.data.alt}
			width={node.size.width}
			height={node.size.height}
		/>
	);
}

type EditDialogProps = {
	node: ImageNodeProps;
	onClose: (event: FormEvent, submit?: boolean) => void;
} & Omit<DialogProps, "onClose">;

function EditDialog({ node, onClose }: EditDialogProps) {
	const { setNode } = useNodesActions();
	const { addOrUpdate } = useIndexedDB<Blob>("images");

	const [image, setImage] = useState<HTMLImageElement | null>(null);

	async function fetchImage(url: string) {
		setImage(await preloadImage(url));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event?.preventDefault();

		if (!image) {
			return;
		}

		// fetch image and get blob data
		const response = await fetch(image.src);
		const blob = await response.blob();

		// add image blob to indexedDB
		await addOrUpdate(blob, node.id);

		// update node data
		setNode<ImageNodeProps>(node.id, {
			size: { width: image.naturalWidth, height: image.naturalHeight },
			data: { src: image.src },
		});

		onClose?.(event, true);
	}

	function handleResetForm() {
		if (!image) {
			return;
		}

		URL.revokeObjectURL(image.src);
		setImage(null);
	}

	return (
		<Portal>
			<Dialog
				onClose={onClose}
				className="rounded-md bg-white shadow-3xl backdrop:bg-black/50 pointer-events-auto"
			>
				<form
					method="dialog"
					onSubmit={handleSubmit}
					className="p-4 text-xs bg-white space-y-4 w-80"
				>
					{!image && (
						<>
							<ImageUploadInput onChange={fetchImage} />
							<p className="text-center">or</p>
							<ImageURLInput onChange={fetchImage} />
						</>
					)}

					{image && (
						<div className="space-y-2">
							<img
								id="img"
								src={image.src}
								alt="image"
								className="rounded-md mx-auto w-full"
							/>
							<div>
								w:{image.naturalWidth} x h:{image.naturalHeight}
							</div>
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
									intent="secondary"
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
		</Portal>
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

	// emulate click event on file input
	function handleClick() {
		fileRef.current?.click();
	}

	function handleReadFile(event: ChangeEvent<HTMLInputElement>) {
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
			onFocus={(event) => event?.stopPropagation()}
		>
			<input
				hidden
				aria-hidden
				ref={fileRef}
				type="file"
				accept="image/png"
				className="w-fit"
				onChange={handleReadFile}
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
