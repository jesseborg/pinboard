// Modified version of the code from
// https://usehooks.com/uselocalstorage

import {
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from "react";

function dispatchStorageEvent<T extends string | null | undefined>(
	key: string,
	newValue: T
) {
	window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

function getLocalStorageItem(key: string) {
	return window.localStorage.getItem(key)!;
}

function setLocalStorageItem<T>(key: string, value: T) {
	const stringifiedValue = JSON.stringify(value);
	window.localStorage.setItem(key, stringifiedValue);
	dispatchStorageEvent(key, stringifiedValue);
}

function removeLocalStorageItem(key: string) {
	window.localStorage.removeItem(key);
	dispatchStorageEvent(key, null);
}

function useLocalStorageSubscribe(callback: () => void) {
	window.addEventListener("storage", callback);
	return () => window.removeEventListener("storage", callback);
}

function getLocalStorageServerSnapshot<T>(): T {
	throw Error("useLocalStorage is a client-only hook");
}

export function useLocalStorage<T>(key: string, initialValue: T | null = null) {
	const snapshot = useMemo(() => getLocalStorageItem(key), [key]);

	const store = useSyncExternalStore<string>(
		useLocalStorageSubscribe,
		() => snapshot,
		getLocalStorageServerSnapshot
	);

	const setState = useCallback(
		(value: SetStateAction<T>) => {
			try {
				const nextState =
					value instanceof Function ? value(JSON.parse(store)) : value;

				if (nextState === undefined || nextState === null) {
					removeLocalStorageItem(key);
				} else {
					setLocalStorageItem(key, nextState);
				}
			} catch (e) {
				console.warn(e);
			}
		},
		[key, store]
	);

	useEffect(() => {
		if (
			getLocalStorageItem(key) === null &&
			typeof initialValue !== "undefined"
		) {
			setLocalStorageItem(key, initialValue);
		}
	}, [key, initialValue]);

	return [store ? (JSON.parse(store) as T) : initialValue, setState] as const;
}
