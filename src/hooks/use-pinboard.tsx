import { PinboardContext } from "@/components/pinboard/pinboard";
import { useContext } from "react";

export function usePinboard() {
	const context = useContext(PinboardContext);

	if (!context) {
		throw new Error("usePinboard must be used within the Pinboard component");
	}

	return context;
}
