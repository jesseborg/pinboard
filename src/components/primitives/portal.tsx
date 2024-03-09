import { ComponentPropsWithoutRef } from "react";
import { createPortal } from "react-dom";
import { Slot } from "./slot";

export type PortalProps = ComponentPropsWithoutRef<"div"> & {
	asChild?: boolean;
	container?: HTMLElement | null;
};
export function Portal({
	asChild = false,
	container = globalThis?.document?.body,
	...props
}: PortalProps) {
	const Component = asChild ? Slot : "div";
	return container ? createPortal(<Component {...props} />, container) : null;
}
