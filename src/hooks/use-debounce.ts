import { DependencyList, useCallback, useRef } from "react";

const useDebounce = (
	callback: Function,
	delay: number,
	dependencies?: DependencyList
) => {
	const timeout = useRef<NodeJS.Timeout>();
	const deps: DependencyList = dependencies
		? [callback, delay, ...dependencies]
		: [callback, delay];

	return useCallback((...args: any[]) => {
		if (timeout.current != null) {
			clearTimeout(timeout.current);
		}

		timeout.current = setTimeout(() => callback(...args), delay);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
};

export default useDebounce;
