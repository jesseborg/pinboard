import { CustomNodeProps, NodeProps } from "../pinboard/types";
import { BaseNode } from "./base-node";

export type ImageNodeProps = NodeProps & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export function ImageNode({ node }: CustomNodeProps<ImageNodeProps>) {
	return (
		<BaseNode>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={node.data.src} alt={node.data.alt} />
		</BaseNode>
	);
}
