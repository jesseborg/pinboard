import useDebounce from "@/hooks/use-debounce";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { blobToWebP, preloadImage } from "@/lib/utils";
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
import { CustomNodeProps } from "../pinboard/types";
import { Button } from "../primitives/button";
import { Dialog, DialogProps } from "../primitives/dialog";
import { Portal } from "../primitives/portal";
import { BaseNode } from "./base-node";

type ImageNodeType = CustomNodeProps<
	"image",
	{
		src: string;
		alt?: string;
		showAlt?: boolean;
	}
>;
export type ImageNodeProps = ImageNodeType["node"];

export function BaseImageNode({ node }: ImageNodeType) {
	const { removeNode, setNode } = useNodesActions();
	const { getById } = useIndexedDB<Blob>("images");

	const [editing, setEditing] = useState(!node.data);

	function handleDialogClose(submit?: boolean) {
		setEditing(false);

		if (!submit && node.data && !Object.entries(node.data).length) {
			removeNode(node.id);
		}
	}

	// Object URLs are not persisted across sessions
	// this will create a new URL on the first render from the IndexedDB Blob
	useEffect(() => {
		async function getBlobData() {
			if (!node.data) {
				return;
			}

			// This will revoke the temporary URL created after uploading an image
			if (node.data.src?.startsWith("blob:")) {
				URL.revokeObjectURL(node.data.src);
			}

			const blob = await getById(node.id);
			setNode<ImageNodeProps>(node.id, {
				data: { src: URL.createObjectURL(blob) },
			});
		}

		getBlobData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<BaseNode node={node} handleEdit={() => setEditing(true)}>
				<Image node={node} />
			</BaseNode>

			<Tag node={node} />

			{editing && <EditDialog node={node} onClose={handleDialogClose} />}
		</>
	);
}
export const ImageNode = memo(BaseImageNode);

function Tag({ node }: { node: ImageNodeProps }) {
	if (!node.data?.showAlt || !node.data?.alt || !node.size) {
		return null;
	}

	return (
		<div className="px-2" style={{ maxWidth: node.size.width }}>
			<p className="bg-black max-w-full text-center w-fit relative text-white px-4 mx-auto py-2 z-50 break-words -mt-4">
				{node.data?.alt}
			</p>
		</div>
	);
}

function Image({ node }: { node: ImageNodeProps }) {
	if (!node.data || !node.size) {
		return (
			<div className="size-64 flex items-center justify-center">
				<ImageIcon className="w-12 h-12" />
			</div>
		);
	}

	return (
		<img
			src={node.data.src}
			alt={node.data.alt}
			width={node.size.width}
			height={node.size.height}
		/>
	);
}

type EditDialogProps = {
	node: ImageNodeProps;
	onClose: (submit?: boolean) => void;
} & Omit<DialogProps, "onClose">;

function EditDialog({ node, onClose }: EditDialogProps) {
	const { setNode } = useNodesActions();
	const { addOrUpdate } = useIndexedDB<Blob>("images");

	const [image, setImage] = useState(
		document.querySelector(`[id="${node.id}"] img`) as HTMLImageElement | null
	);

	// if image.src and node.src match, we're editing, otherwise we're submitting
	const hasMatchingImages = image?.src === node.data?.src;

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
		const blob = await blobToWebP(await response.blob());

		if (!blob) {
			return;
		}

		// add image blob to indexedDB
		await addOrUpdate(blob, node.id);

		// Create a temporary url, gets erased after ImageNode first render
		const url = URL.createObjectURL(blob);

		// update node data
		setNode<ImageNodeProps>(node.id, {
			size: { width: image.naturalWidth, height: image.naturalHeight },
			data: { src: url },
		});

		onClose?.(true);
	}

	function handleCancel() {
		if (hasMatchingImages) {
			onClose?.(false);
			return;
		}

		setImage(null);
	}

	function handleAltTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
		setNode<ImageNodeProps>(node.id, { data: { alt: event.target.value } });
	}

	function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
		setNode<ImageNodeProps>(node.id, {
			data: { showAlt: event.target.checked },
		});
	}

	return (
		<Portal>
			<Dialog
				onClose={() => onClose?.(false)}
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
							{/* Image Preview */}
							<img
								id="img"
								src={image?.src}
								alt="image"
								className="rounded-md mx-auto w-full"
							/>

							{/* Image Information */}
							<div className="space-x-2">
								<span className="text-neutral-400">w:</span>
								{image?.naturalWidth}px
								<span className="text-neutral-400">h:</span>
								{image?.naturalHeight}px
								<span className="text-neutral-400">(above not to scale)</span>
							</div>

							{/* Image Description */}
							<div className="space-y-1">
								<div className="flex w-full">
									<label htmlFor="alt" className="flex-1">
										Image Description
									</label>

									{/* Show Alt Checkbox */}
									<div className="flex items-center gap-2">
										<span className="flex focus-within:outline outline-2 rounded-[1px] outline-offset-1 outline-black p-0">
											<input
												className="accent-black"
												id="showAlt"
												type="checkbox"
												value="showAlt"
												defaultChecked={node.data?.showAlt}
												onChange={handleCheckboxChange}
											/>
										</span>
										<label htmlFor="showAlt">Visible</label>
									</div>
								</div>
								<textarea
									id="alt"
									rows={2}
									className="ring-1 ring-neutral-400 rounded-md w-full p-2 min-h-[48px]"
									value={node.data?.alt}
									placeholder="image description"
									onChange={handleAltTextChange}
								/>
							</div>
							{/* Buttons */}
							<div className="flex gap-2">
								{!hasMatchingImages && (
									<Button
										formMethod="dialog"
										type="submit"
										size="xs"
										className="w-full"
									>
										Submit
									</Button>
								)}
								{hasMatchingImages && (
									<Button
										size="xs"
										className="w-full"
										onClick={() => setImage(null)}
									>
										Replace
									</Button>
								)}
								<Button
									type="reset"
									intent="secondary"
									size="xs"
									className="w-full"
									onClick={handleCancel}
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
