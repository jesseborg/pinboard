import { CustomNode, NodeProps } from "../pinboard/pinboard";
import { BaseNode } from "./base-node";

export type ImageNode = NodeProps & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export function ImageNode({ node }: CustomNode<ImageNode>) {
	return (
		<BaseNode>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={node.data.src} alt={node.data.alt} />;
		</BaseNode>
	);
}
