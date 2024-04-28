import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { Slot } from "./slot";

export type PortalProps = ComponentPropsWithoutRef<"div"> & {
	asChild?: boolean;
	container?: HTMLElement | null;
};
export const Portal = forwardRef<ElementRef<"div">, PortalProps>(
	(
		{ asChild = false, container = globalThis.document.body, ...props },
		ref
	) => {
		const Component = asChild ? Slot : "div";
		return container
			? createPortal(<Component {...props} ref={ref} />, container)
			: null;
	}
);
