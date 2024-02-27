import { PropsWithChildren } from "react";

type BaseNodeProps = {
	/* ... */
};

export function BaseNode({ children }: PropsWithChildren<BaseNodeProps>) {
	return (
		<div className="border-2 border-black p-2 bg-white shadow-[2px_2px] shadow-black">
			{children}
		</div>
	);
}
