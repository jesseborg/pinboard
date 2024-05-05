import { DependencyList, MutableRefObject, useEffect, useState } from "react";

const IGNORE_ELEMENTS = ["textarea", "input"];

type UseKeyDownOptions = {
	ignoreWhileInput?: boolean;
};

type SelectorType<T = HTMLElement | null> = MutableRefObject<T> | T | string;

type CallbackProps<K> = {
	key: K;
	element: HTMLElement;
	event: KeyboardEvent;
};

export function useKeyDown<K extends string>(
	ref: SelectorType,
	keys: K | Array<K>,
	callback?: (event: CallbackProps<K>) => void,
	options?: UseKeyDownOptions | null,
	deps?: DependencyList
) {
	const [keyDown, setKeyDown] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (document.querySelector("dialog[open]")) {
				return;
			}

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

			callback?.({
				key: event.key as K,
				// element will never be null here
				element: element as HTMLElement,
				event,
			});
			setKeyDown(true);
		}

		function handleKeyUp() {
			setKeyDown(false);
		}

		const element = getElement(ref);

		if (!element) {
			return;
		}

		element.addEventListener("keydown", handleKeyDown);
		element.addEventListener("keyup", handleKeyUp);

		return () => {
			element.removeEventListener("keydown", handleKeyDown);
			element.removeEventListener("keyup", handleKeyUp);
		};
	}, [keys, callback, ref, deps, options]);

	return keyDown;
}

function getElement(ref: SelectorType) {
	if (typeof ref === "string") {
		return document.querySelector(ref) as HTMLElement | null;
	}

	if (ref && "current" in ref) {
		return ref.current;
	}

	return ref;
}
