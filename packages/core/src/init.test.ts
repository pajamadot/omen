import { describe, it, expect } from "vitest";
import { baselineGenes, baselineCapsules, baselineEvolutionState, bootstrapData } from "./init.js";
import { createMockAdapter } from "./test-utils.js";

describe("baselineGenes", () => {
	it("returns 4 baseline genes", () => {
		const genes = baselineGenes();
		expect(genes).toHaveLength(4);
		expect(genes.map((g) => g.gene_id)).toEqual([
			"gene_repair_minimal_v1",
			"gene_harden_tests_v1",
			"gene_optimize_hotpath_v1",
			"gene_innovate_small_feature_v1",
		]);
	});

	it("all genes have required fields", () => {
		for (const gene of baselineGenes()) {
			expect(gene.name).toBeTruthy();
			expect(gene.when_to_use.length).toBeGreaterThan(0);
			expect(gene.steps.length).toBeGreaterThan(0);
			expect(gene.rollback).toBeTruthy();
		}
	});
});

describe("baselineCapsules", () => {
	it("returns 3 baseline capsules", () => {
		const caps = baselineCapsules();
		expect(caps).toHaveLength(3);
		expect(caps.map((c) => c.capsule_id)).toEqual([
			"cap_logging_v1",
			"cap_redaction_v1",
			"cap_rollback_v1",
		]);
	});
});

describe("baselineEvolutionState", () => {
	it("starts with review_mode=true and cycle 0", () => {
		const state = baselineEvolutionState();
		expect(state.current_cycle).toBe(0);
		expect(state.review_mode).toBe(true);
		expect(state.evolve_strategy).toBe("balanced");
	});
});

describe("bootstrapData", () => {
	it("seeds data into empty db", async () => {
		const db = createMockAdapter();
		const result = await bootstrapData(db);
		expect(result.seeded).toBe(true);
	});

	it("skips if persona already exists", async () => {
		const db = createMockAdapter();
		await bootstrapData(db);
		const result = await bootstrapData(db);
		expect(result.seeded).toBe(false);
	});
});
