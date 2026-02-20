import { describe, it, expect } from "vitest";
import { runEvolutionCycle } from "./evolution-loop.js";
import { bootstrapData } from "./init.js";
import { createSignal } from "./signal.js";
import { createMockAdapter } from "./test-utils.js";

describe("runEvolutionCycle", () => {
	it("throws if not bootstrapped", async () => {
		const db = createMockAdapter();
		await expect(runEvolutionCycle(db, [])).rejects.toThrow("not initialized");
	});

	it("runs a complete cycle with no signals", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);

		const result = await runEvolutionCycle(db, []);

		expect(result.cycle_header.cycle_number).toBe(1);
		expect(result.cycle_header.strategy).toBe("balanced");
		expect(result.evolution_event.event_id).toMatch(/^ev_/);
		expect(result.evolution_event.outcome.success).toBe(true);
		// First 3 cycles should be in review mode
		expect(result.blockers).toBeDefined();
		expect(result.blockers![0]).toContain("REVIEW_MODE");
	});

	it("runs cycle with incoming signals", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);

		const signals = [
			createSignal({
				title: "API timeout",
				category: "error",
				severity: 5,
				frequency: "frequent",
				impacted_components: ["api"],
				suspected_root_cause: "slow query",
				evidence_summary: "P99 latency > 5s",
			}),
		];

		const result = await runEvolutionCycle(db, signals);

		expect(result.signals).toHaveLength(1);
		expect(result.selector_decision.selected_gene_id).toBeTruthy();
		expect(result.evolution_event.signals).toHaveLength(1);
	});

	it("increments cycle count across runs", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);

		const r1 = await runEvolutionCycle(db, []);
		const r2 = await runEvolutionCycle(db, []);
		const r3 = await runEvolutionCycle(db, []);

		expect(r1.cycle_header.cycle_number).toBe(1);
		expect(r2.cycle_header.cycle_number).toBe(2);
		expect(r3.cycle_header.cycle_number).toBe(3);
	});

	it("evolves personality each cycle", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);

		const r1 = await runEvolutionCycle(db, []);
		const traits1 = r1.evolution_event.personality_state.traits;

		const r2 = await runEvolutionCycle(db, []);
		const traits2 = r2.evolution_event.personality_state.traits;

		// Creativity should increase on clean success
		expect(traits2.creativity).toBeGreaterThan(traits1.creativity);
	});

	it("selects a gene from baseline genes", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);

		const result = await runEvolutionCycle(db, []);
		expect(result.selector_decision.selected_gene_id).not.toBe("none");
	});

	it("disables review_mode after cycle 3", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);

		await runEvolutionCycle(db, []);
		await runEvolutionCycle(db, []);
		await runEvolutionCycle(db, []);
		const r4 = await runEvolutionCycle(db, []);

		// Cycle 4 should have review mode off
		expect(r4.blockers).toBeUndefined();
	});
});
