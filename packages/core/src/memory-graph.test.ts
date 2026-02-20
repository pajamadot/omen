import { describe, it, expect } from "vitest";
import { createMemoryNode, buildChain } from "./memory-graph.js";

describe("createMemoryNode", () => {
	it("creates a node with auto-generated id", () => {
		const node = createMemoryNode({
			type: "signal",
			data: { title: "test" },
		});

		expect(node.id).toMatch(/^mem_signal_/);
		expect(node.type).toBe("signal");
		expect(node.parent_id).toBeNull();
		expect(node.data.title).toBe("test");
		expect(node.timestamp).toBeTruthy();
	});

	it("accepts parent_id", () => {
		const node = createMemoryNode({
			type: "hypothesis",
			parent_id: "mem_signal_123",
			data: { hypothesis: "root cause is X" },
		});

		expect(node.parent_id).toBe("mem_signal_123");
	});
});

describe("buildChain", () => {
	it("follows parent chain to root", () => {
		const nodes = [
			{ id: "a", type: "signal" as const, parent_id: null, timestamp: "2024-01-01", data: {}, metadata: null },
			{ id: "b", type: "hypothesis" as const, parent_id: "a", timestamp: "2024-01-02", data: {}, metadata: null },
			{ id: "c", type: "attempt" as const, parent_id: "b", timestamp: "2024-01-03", data: {}, metadata: null },
			{ id: "d", type: "outcome" as const, parent_id: "c", timestamp: "2024-01-04", data: {}, metadata: null },
		];

		const chain = buildChain(nodes, "d");
		expect(chain.map((n) => n.id)).toEqual(["d", "c", "b", "a"]);
	});

	it("returns single node if no parent", () => {
		const nodes = [
			{ id: "x", type: "signal" as const, parent_id: null, timestamp: "2024-01-01", data: {}, metadata: null },
		];

		const chain = buildChain(nodes, "x");
		expect(chain).toHaveLength(1);
	});

	it("returns empty for unknown id", () => {
		const chain = buildChain([], "nonexistent");
		expect(chain).toHaveLength(0);
	});
});
