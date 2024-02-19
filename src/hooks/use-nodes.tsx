"use client";

import { Node } from "@/components/node";
import { useState } from "react";

export function useNodes() {
	const [nodes, setNodesInternal] = useState<Array<Node>>(
		JSON.parse(localStorage.getItem("nodes") || "{}") as Array<Node>
	);

	function setNodes(nodes: Array<Node>) {
		localStorage.setItem("nodes", JSON.stringify(nodes));
		setNodesInternal(nodes);
	}

	return { nodes, setNodes };
}
