import { useKeyDown } from "@/hooks/use-keydown";
import { cn } from "@/lib/utils";
import {
	usePinBoardActions,
	usePinBoardName,
} from "@/stores/use-pinboard-store";
import { FocusEvent, useRef, useState } from "react";

export function NameContainer() {
	const name = usePinBoardName();
	const { setName } = usePinBoardActions();

	const [editing, setEditing] = useState(false);

	const inputRef = useRef<HTMLInputElement | null>(null);

	function handleBlur(event: FocusEvent) {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(event.target)) {
			window.getSelection()?.empty();
		}
	}

	useKeyDown(inputRef, ["Enter", "Escape"], (key) => {
		if (key === "Enter") {
			setEditing(true);
			return;
		}

		if (key === "Escape") {
			setEditing(false);
			return;
		}
	});

	return (
		<div className="absolute flex w-full justify-center pt-6 z-50">
			<input
				ref={inputRef}
				autoComplete="off"
				autoCapitalize="off"
				autoCorrect="off"
				readOnly={!editing}
				spellCheck={editing}
				maxLength={25}
				className={cn(
					"px-4 py-2 bg-white text-sm font-light w-64 shadow-sm text-center cursor-default outline-none focus:ring-2 ring-black",
					{
						"cursor-text outline outline-2": editing,
					}
				)}
				defaultValue={name}
				onChange={({ target: { value } }) => setName(value)}
				onDoubleClick={() => setEditing(true)}
				onBlur={handleBlur}
			/>
		</div>
	);
}
