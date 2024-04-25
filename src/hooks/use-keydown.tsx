import { DependencyList, MutableRefObject, useEffect, useState } from "react";

const IGNORE_ELEMENTS = ["textarea", "input"];

type UseKeyDownOptions = {
	ignoreWhileInput?: boolean;
};

export function useKeyDown<K extends string, T extends HTMLElement>(
	ref: MutableRefObject<T | null> | T | null,
	keys: K | Array<K>,
	callback?: (key: K) => void,
	options?: UseKeyDownOptions | null,
	deps?: DependencyList
) {
	const [keyDown, setKeyDown] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Handle single keys
			if (typeof keys === "string" && event.key !== keys) {
				return;
			}

			// Handle multiple keys
			if (typeof keys === "object" && !keys.includes(event.key as K)) {
				return;
			}

			// Check if the currently active element is one of the ignored elements
			if (
				options?.ignoreWhileInput &&
				document.activeElement?.localName &&
				IGNORE_ELEMENTS.includes(document.activeElement.localName)
			) {
				return;
			}

			callback?.(event.key as K);
			setKeyDown(true);
		}

		function handleKeyUp() {
			setKeyDown(false);
		}

		const element = ref instanceof HTMLElement ? ref : ref?.current;
		element?.addEventListener("keydown", handleKeyDown);
		element?.addEventListener("keyup", handleKeyUp);

		return () => {
			element?.removeEventListener("keydown", handleKeyDown);
			element?.removeEventListener("keyup", handleKeyUp);
		};
	}, [keys, callback, ref, deps, options]);

	return keyDown;
}
