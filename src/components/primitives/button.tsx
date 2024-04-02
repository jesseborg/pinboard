import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef, HTMLAttributes, PropsWithChildren } from "react";

const button = cva("button", {
	variants: {
		intent: {
			primary: ["bg-black text-white rounded-md p-2"],
			blank: "",
		},
		size: {
			xs: ["text-xs"],
			sm: ["text-sm"],
			md: ["text-base"],
		},
	},
	compoundVariants: [{ intent: "primary", size: "md" }],
	defaultVariants: {
		intent: "primary",
		size: "md",
	},
});

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof button> {}
type ButtonPropsWithChildren = PropsWithChildren<ButtonProps>;
type ButtonPropsWithAttributes = ButtonPropsWithChildren &
	HTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonPropsWithAttributes>(
	({ intent, size, className, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={button({ intent, size, className })}
				{...props}
			>
				{children}
			</button>
		);
	}
);
Button.displayName = "Button";
