import { HTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = {};
type ButtonPropsWithChildren = PropsWithChildren<ButtonProps>;
type ButtonPropsWithAttributes = ButtonPropsWithChildren &
	HTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...props }: ButtonPropsWithAttributes) {
	return <button {...props}>{children}</button>;
}
