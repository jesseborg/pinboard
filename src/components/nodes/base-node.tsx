import { cn } from "@/lib/utils";
import { HTMLAttributes, PropsWithChildren } from "react";

type BaseNodeProps = {
	/* ... */
};

export function BaseNode({
	className,
	children,
}: PropsWithChildren<BaseNodeProps & HTMLAttributes<HTMLDivElement>>) {
	return (
		<div
			className={cn(
				"border-2 border-black p-2 bg-white shadow-[2px_2px] shadow-black",
				className
			)}
		>
			{children}
		</div>
	);
}
