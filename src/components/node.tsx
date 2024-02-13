export type Point = {
	x: number;
	y: number;
};

type BaseNode = {
	id: string;
	position: Point;
};
type TextNode = BaseNode & {
	type: "text";
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

export type Node = TextNode | ImageNode;

export function renderNode(node: Node) {
	switch (node.type) {
		case "text":
			return <p>{node.data.label}</p>;

		case "image":
			return <img src={node.data.src} alt={node.data.alt} />;
	}
}
