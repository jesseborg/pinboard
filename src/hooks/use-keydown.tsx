import { DependencyList, useEffect } from "react";

export function useKeyDown(
	keys: string | Array<string>,
	callback: Function,
	deps: DependencyList
) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (typeof keys === "string" && event.key !== keys) {
				return;
			}

			if (typeof keys === "object" && !keys.includes(event.key)) {
				return;
			}

			callback();
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keys, callback, ...deps]);
}
