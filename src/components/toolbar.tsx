import { useNodesActions } from "@/stores/use-nodes-store";
import { PropsWithChildren, ReactNode } from "react";
import { nodeTypes } from "./app";
import { Button } from "./button";
import { ImageIcon } from "./icons/image-icon";
import { NoteIcon } from "./icons/note-icon";
import * as ToolTipPrimitive from "./tooltip/tooltip";

export function ToolBar() {
	const { addNode } = useNodesActions<typeof nodeTypes>();

	return (
		<ToolTipPrimitive.Provider delay={150}>
			<div className="absolute z-20 text-white h-full pl-6 flex">
				<div className="flex self-center gap-1.5 flex-col bg-black p-1.5 rounded-md">
					<ToolTip
						content={
							<p className="leading-3">
								Note <span className="text-neutral-400">N</span>
							</p>
						}
					>
						<Button onClick={() => addNode("mdx", { data: { label: "" } })}>
							<NoteIcon />
						</Button>
					</ToolTip>
					<ToolTip
						content={
							<p className="leading-3">
								Image <span className="text-neutral-400">I</span>
							</p>
						}
					>
						<Button
							onClick={() =>
								addNode("image", {
									data: {
										src: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=240",
										alt: "photo of a cat yawning",
									},
								})
							}
						>
							<ImageIcon />
						</Button>
					</ToolTip>
				</div>
			</div>
		</ToolTipPrimitive.Provider>
	);
}

type ToolTipProps = {
	content: ReactNode;
} & Partial<ToolTipPrimitive.BaseContentProps>;
export const ToolTip = ({
	content,
	children,
	...contentProps
}: PropsWithChildren<ToolTipProps>) => {
	return (
		<ToolTipPrimitive.Root>
			<ToolTipPrimitive.Trigger asChild>{children}</ToolTipPrimitive.Trigger>
			<ToolTipPrimitive.Portal>
				<ToolTipPrimitive.Content
					side="right"
					align="center"
					sideOffset={14}
					className="bg-black text-white text-xs p-2 rounded-[4px]"
					{...contentProps}
				>
					{content}
				</ToolTipPrimitive.Content>
			</ToolTipPrimitive.Portal>
		</ToolTipPrimitive.Root>
	);
};
