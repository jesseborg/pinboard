/* --- Slot --- */
/* reference: https://www.jacobparis.com/content/react-as-child */

import { cn } from "@/lib/utils";
import React, { HTMLAttributes, PropsWithChildren, forwardRef } from "react";

type SlotProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

export const Slot = forwardRef<HTMLElement, SlotProps>(
	({ children, ...props }, ref) => {
		if (React.isValidElement(children)) {
			return React.cloneElement(children, {
				ref,
				...props,
				...children.props,
				style: {
					...props.style,
					...children.props.style,
				},
				className: cn(props.className, children.props.className),
			});
		}

		if (React.Children.count(children) > 1) {
			React.Children.only(null);
		}

		return null;
	}
);
Slot.displayName = "Slot";
