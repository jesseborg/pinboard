import { PropsWithChildren } from "react";

type ButtonProps = {};

export function Button({ children }: PropsWithChildren<ButtonProps>) {
	return <button>{children}</button>;
}
