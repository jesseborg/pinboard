import {
	ComponentProps,
	FormEvent,
	MouseEvent,
	PropsWithChildren,
	useLayoutEffect,
	useRef,
} from "react";

type BaseDialogProps = {
	onClose?: (event: FormEvent) => void;
};

export type DialogProps = BaseDialogProps & ComponentProps<"dialog">;

export function Dialog({
	onClose,
	children,
	...props
}: PropsWithChildren<DialogProps>) {
	const ref = useRef<HTMLDialogElement>(null);

	useLayoutEffect(() => {
		ref.current?.showModal();
	}, []);

	function handleOnClick(event: MouseEvent<HTMLDialogElement>) {
		if (event.target === ref.current) {
			ref.current?.close();
			onClose?.(event);
		}
	}

	function handleClose(event: FormEvent) {
		onClose?.(event);
	}

	return (
		<dialog ref={ref} onClick={handleOnClick} onClose={handleClose} {...props}>
			{children}
		</dialog>
	);
}
