import { useKeyDown } from "@/hooks/use-keydown";
import { useNodesActions } from "@/stores/use-nodes-store";
import { PropsWithChildren, ReactNode, useRef } from "react";
import { nodeTypes } from "../app";
import { ImageIcon } from "./icons/image-icon";
import { NoteIcon } from "./icons/note-icon";
import { Button } from "./primitives/button";
import * as ToolTipPrimitive from "./primitives/tooltip";

export function ToolBar() {
	const { addNode } = useNodesActions<typeof nodeTypes>();

	const ref = useRef<HTMLDivElement | null>(null);

	useKeyDown(
		ref,
		["ArrowDown", "ArrowUp"],
		(key) => {
			const children = Array.from(
				(ref.current?.childNodes as NodeListOf<HTMLElement>) ?? []
			);
			const index = children.indexOf(document.activeElement! as HTMLElement);

			if (key === "ArrowDown") {
				children.at(-(index + 1))?.focus();
			}

			if (key === "ArrowUp") {
				children.at(index - 1)?.focus();
			}
		},
		null,
		[ref]
	);

	return (
		<ToolTipPrimitive.Provider>
			<div className="fixed z-20 text-white pl-6 flex top-1/2 -translate-y-1/2">
				<div
					ref={ref}
					className="flex gap-1.5 flex-col bg-black p-1.5 rounded-md"
				>
					<ToolTip
						content={
							<p className="leading-3">
								Note <span className="text-neutral-400">N</span>
							</p>
						}
					>
						<Button intent="blank" onClick={() => addNode("note")}>
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
						<Button intent="blank" onClick={() => addNode("image")}>
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
