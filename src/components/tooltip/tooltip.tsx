import {
	Portal as PrimitivePortal,
	type PortalProps as PrimitivePortalProps,
} from "@/components/primitives/portal";
import React, {
	HTMLAttributes,
	PropsWithChildren,
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Slot } from "../primitives/slot";

const ToolTipProviderContext = createContext({
	delay: 0,
});
type ToolTipProviderContextProps =
	typeof ToolTipProviderContext extends React.Context<infer P> ? P : never;

type ToolTipContextProps = {
	anchor: HTMLElement | null;
	setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	open: boolean;
	setOpen: (open: boolean) => void;
};
const ToolTipContext = createContext<ToolTipContextProps | null>(null);

const useToolTip = () => {
	const context = useContext(ToolTipContext);

	if (!context) {
		throw new Error("useToolTip must be used within a ToolTip.Provider");
	}

	return context;
};

function Provider({
	children,
	...props
}: PropsWithChildren<ToolTipProviderContextProps>) {
	return (
		<ToolTipProviderContext.Provider value={props}>
			{children}
		</ToolTipProviderContext.Provider>
	);
}

/* --- ToolTip --- */

function Root({ children }: PropsWithChildren) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [open, setOpen] = useState(false);

	return (
		<ToolTipContext.Provider
			value={{
				anchor,
				setAnchor,
				open,
				setOpen,
			}}
		>
			{children}
		</ToolTipContext.Provider>
	);
}

/* --- ToolTipTrigger --- */

type TriggerProps = {
	/** If true, the child of `ToolTip.Trigger` will be the default rendered element. Merging props and behaviour */
	asChild?: boolean;
};
function Trigger({
	asChild = false,
	...props
}: PropsWithChildren<TriggerProps>) {
	const { setAnchor, setOpen } = useToolTip();

	const ref = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		setAnchor(ref.current);
	}, [setAnchor]);

	function handlePointerLeave() {
		if (document.activeElement === ref.current) {
			return;
		}

		setOpen(false);
	}

	return (
		<PrimitiveButton
			{...props}
			asChild={asChild}
			ref={ref}
			onPointerEnter={() => setOpen(true)}
			onPointerLeave={handlePointerLeave}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		/>
	);
}

type PrimitivePropsWithRef<E extends React.ElementType> =
	React.ComponentPropsWithRef<E> & {
		asChild?: boolean;
	};

const PrimitiveButton = forwardRef(
	({ asChild, ...props }: PrimitivePropsWithRef<"button">, ref: any) => {
		const Comp: any = asChild ? Slot : "button";
		return <Comp {...props} ref={ref} />;
	}
);
PrimitiveButton.displayName = "PrimitiveButton";

/* --- Portal --- */
type PortalProps = PrimitivePortalProps & {
	forceMount?: boolean;
};

function Portal({ container, children }: PropsWithChildren<PortalProps>) {
	return (
		<PrimitivePortal asChild container={container}>
			{children}
		</PrimitivePortal>
	);
}

/* --- ToolTipContent --- */

type BaseContentProps = {
	asChild?: boolean;
	side: "top" | "bottom" | "left" | "right";
	sideOffset: number;
	align: "start" | "center" | "end";
};

type ContentProps = HTMLAttributes<HTMLElement> & Partial<BaseContentProps>;
function Content({
	asChild = false,
	side = "top",
	sideOffset = 0,
	align = "center",
	...props
}: PropsWithChildren<ContentProps>) {
	const Component: any = asChild ? Slot : "div";

	const { anchor, open } = useToolTip();

	const [position, setPosition] = useState<Point | null>(null);

	const ref = useCallback(
		(node: HTMLDivElement) => {
			if (!anchor || !node) {
				return;
			}

			setPosition(
				getPositionFromSide(
					anchor.getBoundingClientRect(),
					node.getBoundingClientRect(),
					side,
					sideOffset,
					align
				)
			);
		},
		[align, anchor, side, sideOffset]
	);

	if (!open) {
		return null;
	}

	return (
		<div
			ref={ref}
			className="fixed top-0 left-0 z-50"
			style={{
				transform: position
					? `translate(${position.x}px, ${position.y}px)`
					: "none",
			}}
		>
			<Component {...props} />
		</div>
	);
}

type Point = { x: number; y: number };
function getPositionFromSide(
	anchorBounds: DOMRect,
	bounds: DOMRect,
	side: BaseContentProps["side"],
	sideOffset: BaseContentProps["sideOffset"],
	align: BaseContentProps["align"]
): Point {
	switch (side) {
		case "top": {
			return {
				x: getAlignment("x", align, anchorBounds, bounds),
				y: anchorBounds.y - anchorBounds.height - sideOffset,
			};
		}
		case "right": {
			return {
				x: anchorBounds.x + anchorBounds.width + sideOffset,
				y: getAlignment("y", align, anchorBounds, bounds),
			};
		}
		case "bottom": {
			return {
				x: getAlignment("x", align, anchorBounds, bounds),
				y: anchorBounds.y + anchorBounds.height + sideOffset,
			};
		}
		case "left": {
			return {
				x: anchorBounds.x - bounds.width - sideOffset,
				y: getAlignment("y", align, anchorBounds, bounds),
			};
		}
	}
}

function getAlignment(
	axis: "x" | "y",
	align: BaseContentProps["align"],
	anchorBounds: DOMRect,
	bounds: DOMRect
) {
	const dimension = axis === "x" ? "width" : "height";
	switch (align) {
		case "start":
			return anchorBounds[axis];
		case "center":
			return (
				anchorBounds[axis] + anchorBounds[dimension] / 2 - bounds[dimension] / 2
			);
		case "end":
			return anchorBounds[axis] + anchorBounds[dimension] - bounds[dimension];
	}
}

export { Content, Portal, Provider, Root, Trigger };
