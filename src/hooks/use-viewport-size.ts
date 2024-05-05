import { useEffect, useState } from "react";

type Size = {
	width: number;
	height: number;
};

type ViewportSizeProps = {
	onChange?: ({ size }: { size: Size }) => void;
};

export function useViewportSize(options?: ViewportSizeProps) {
	const [viewportSize, setViewportSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		function handleResize() {
			const size = { width: window.innerWidth, height: window.innerHeight };
			setViewportSize(size);
			options?.onChange?.({ size });
		}

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [options]);

	return viewportSize;
}
