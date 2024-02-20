import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export type Point = {
	x: number;
	y: number;
};

type BaseNode = {
	id: string;
	position: Point;
};

type MDXNode = BaseNode & {
	type: "mdx";
	data: {
		label: string;
	};
};

type ImageNode = BaseNode & {
	type: "image";
	data: {
		alt: string;
		src: string;
	};
};

export type Node = MDXNode | ImageNode;

function MDXNode(node: MDXNode) {
	return (
		<div>
			<p>{node.data.label}</p>
			{JSON.stringify(node.position)}
		</div>
	);
}

function ImageNode(node: ImageNode) {
	// eslint-disable-next-line @next/next/no-img-element
	return <img src={node.data.src} alt={node.data.alt} />;
}

function NodeSelector(node: Node) {
	switch (node.type) {
		case "mdx":
			return <MDXNode {...node} />;
		case "image":
			return <ImageNode {...node} />;
		default:
			return null;
	}
}

export function Node({
	node,
	className,
	...props
}: { node: Node } & HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			id={node.id}
			style={{
				transform: `translate(${node.position.x}px, ${node.position.y}px)`,
			}}
			className={cn(
				"border-2 border-black p-2 bg-white shadow-[2px_2px] shadow-black",
				className
			)}
		>
			<NodeSelector {...node} />
		</div>
	);
}
