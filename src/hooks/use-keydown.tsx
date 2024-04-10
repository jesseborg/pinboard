import { DependencyList, MutableRefObject, useEffect, useState } from "react";

const IGNORE_ELEMENTS = ["textarea", "input"];

type UseKeyDownOptions = {
	ignoreWhileInput?: boolean;
};

export function useKeyDown<K extends string, T extends HTMLElement>(
	ref: MutableRefObject<T | null>,
	keys: K | Array<K>,
	callback?: (key: K) => void,
	options?: UseKeyDownOptions | null,
	deps?: DependencyList
) {
	const [keyDown, setKeyDown] = useState(false);

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
				return;
			}

			callback?.(event.key as K);
			setKeyDown(true);
		}

		function handleKeyUp() {
			setKeyDown(false);
		}

		const element = ref.current;
		element?.addEventListener("keydown", handleKeyDown);
		element?.addEventListener("keyup", handleKeyUp);

		return () => {
			element?.removeEventListener("keydown", handleKeyDown);
			element?.removeEventListener("keyup", handleKeyUp);
		};
	}, [keys, callback, ref, deps, options]);

	return keyDown;
}
