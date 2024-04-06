import { DependencyList, MutableRefObject, useEffect } from "react";

export function useKeyDown<K extends string>(
	ref: MutableRefObject<HTMLDivElement | null>,
	keys: K | Array<K>,
	callback: (key: K) => void,
	deps?: DependencyList
) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (typeof keys === "string" && event.key !== keys) {
				return;
			}

			if (typeof keys === "object" && !keys.includes(event.key as K)) {
				return;
			}

			callback(event.key as K);
		}

		const element = ref.current;
		element?.addEventListener("keydown", handleKeyDown);

		return () => element?.removeEventListener("keydown", handleKeyDown);
	}, [keys, callback, ref, deps]);
}
