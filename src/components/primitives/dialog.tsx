import {
	ComponentProps,
	MouseEvent,
	PropsWithChildren,
	useLayoutEffect,
	useRef,
} from "react";

type BaseDialogProps = {
	onClose?: () => void;
};

type DialogProps = BaseDialogProps & ComponentProps<"dialog">;

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
			onClose?.();
		}
	}

	function handleClose() {
		onClose?.();
	}

	return (
		<dialog ref={ref} onClick={handleOnClick} onClose={handleClose} {...props}>
			{children}
		</dialog>
	);
}
