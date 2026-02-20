import type { MemoryNode, MemoryNodeType } from "./types.js";

let counter = 0;

export function createMemoryNodeId(type: MemoryNodeType): string {
	counter++;
	return `mem_${type}_${Date.now()}_${counter}`;
}

export function createMemoryNode(opts: {
	type: MemoryNodeType;
	parent_id?: string | null;
	data: Record<string, unknown>;
	metadata?: Record<string, unknown> | null;
}): MemoryNode {
	return {
		id: createMemoryNodeId(opts.type),
		type: opts.type,
		parent_id: opts.parent_id ?? null,
		timestamp: new Date().toISOString(),
		data: opts.data,
		metadata: opts.metadata ?? null,
	};
}

/**
 * Build a chain from a node up to the root by following parent_id links.
 */
export function buildChain(nodes: MemoryNode[], startId: string): MemoryNode[] {
	const map = new Map(nodes.map((n) => [n.id, n]));
	const chain: MemoryNode[] = [];
	let current: MemoryNode | undefined = map.get(startId);

	while (current) {
		chain.push(current);
		current = current.parent_id ? map.get(current.parent_id) : undefined;
	}

	return chain;
}
