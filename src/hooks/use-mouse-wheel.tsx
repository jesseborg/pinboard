import { DependencyList, useEffect } from "react";

type UseMousWheelOptions = {
	ctrlKey?: boolean;
	preventDefault?: boolean;
};

export function useMouseWheel(
	onChange: (event: WheelEvent) => void,
	options?: UseMousWheelOptions,
	deps?: DependencyList
) {
	useEffect(() => {
		function handleScroll(event: WheelEvent) {
			if (options?.ctrlKey && !event.ctrlKey) {
				return;
			}

			if (options?.preventDefault) {
				event.preventDefault();
			}

			onChange(event);
		}

		window.addEventListener("wheel", handleScroll, { passive: false });

		return () => {
			window.removeEventListener("wheel", handleScroll);
		};
	}, [deps]);
}
