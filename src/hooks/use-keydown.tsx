import { DependencyList, MutableRefObject, useEffect } from "react";

const IGNORE_ELEMENTS = ["textarea", "input"];

type UseKeyDownOptions = {
	ignoreWhileInput?: boolean;
};

export function useKeyDown<K extends string, T extends HTMLElement>(
	ref: MutableRefObject<T | null>,
	keys: K | Array<K>,
	callback: (key: K) => void,
	options?: UseKeyDownOptions | null,
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

			if (
				options?.ignoreWhileInput &&
				document.activeElement?.localName &&
				IGNORE_ELEMENTS.includes(document.activeElement.localName)
			) {
				console.log("ignoring hotkey, input active:", document.activeElement);
				return;
			}

			callback(event.key as K);
		}

		const element = ref.current;
		element?.addEventListener("keydown", handleKeyDown);

		return () => element?.removeEventListener("keydown", handleKeyDown);
	}, [keys, callback, ref, deps, options]);
}
