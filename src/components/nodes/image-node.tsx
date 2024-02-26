import { forwardRef } from "react";
import { NodeProps } from "../pinboard/pinboard";
import { NodeHandle } from "./types";

export type ImageNode = NodeProps & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export const ImageNode = forwardRef<NodeHandle, ImageNode>((node, _) => {
	// eslint-disable-next-line @next/next/no-img-element
	return <img src={node.data.src} alt={node.data.alt} />;
});
ImageNode.displayName = "ImageNode";
