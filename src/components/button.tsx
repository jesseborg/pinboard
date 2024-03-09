import { HTMLAttributes, PropsWithChildren, forwardRef } from "react";

type ButtonProps = {};
type ButtonPropsWithChildren = PropsWithChildren<ButtonProps>;
type ButtonPropsWithAttributes = ButtonPropsWithChildren &
	HTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonPropsWithAttributes>(
	({ children, ...props }, ref) => {
		return (
			<button ref={ref} {...props}>
				{children}
			</button>
		);
	}
);
Button.displayName = "Button";
