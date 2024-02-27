import { forwardRef } from "react";
import { NodeProps } from "../pinboard/pinboard";
import { BaseNode } from "./base-node";
import { NodeHandle } from "./types";

export type ImageNode = NodeProps & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export const ImageNode = forwardRef<NodeHandle, ImageNode>((node, _) => {
	return (
		<BaseNode>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={node.data.src} alt={node.data.alt} />;
		</BaseNode>
	);
});
ImageNode.displayName = "ImageNode";
