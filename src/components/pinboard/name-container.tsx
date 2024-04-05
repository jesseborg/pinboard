import { cn } from "@/lib/utils";
import {
	usePinBoardActions,
	usePinBoardName,
} from "@/stores/use-pinboard-store";
import { FocusEvent, useState } from "react";

export function NameContainer() {
	const name = usePinBoardName();
	const { setName } = usePinBoardActions();

	const [editing, setEditing] = useState(false);

	function handleBlur(event: FocusEvent) {
		setEditing(false);

		if (window.getSelection()?.focusNode?.contains(event.target)) {
			window.getSelection()?.empty();
		}
	}

	return (
		<div className="absolute flex w-full justify-center pt-6 z-50">
			<input
				autoComplete="off"
				autoCapitalize="off"
				autoCorrect="off"
				readOnly={!editing}
				spellCheck={editing}
				maxLength={25}
				className={cn(
					"px-4 py-2 bg-white text-sm font-light w-64 shadow-sm text-center cursor-default outline-none",
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
