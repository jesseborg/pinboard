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
			if (options?.preventDefault) {
				event.preventDefault();
			}

			if (document.querySelector("dialog[open]")) {
				return;
			}

			if (options?.ctrlKey && !event.ctrlKey) {
				return;
			}

			onChange(event);
		}

		window.addEventListener("wheel", handleScroll, { passive: false });

		return () => {
			window.removeEventListener("wheel", handleScroll);
		};
	}, [deps]);
}
