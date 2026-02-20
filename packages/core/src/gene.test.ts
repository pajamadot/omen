import { describe, it, expect } from "vitest";
import { selectGene } from "./gene.js";
import { baselineGenes } from "./init.js";
import type { Signal } from "./types.js";

const genes = baselineGenes();

function makeSignal(overrides: Partial<Signal> = {}): Signal {
	return {
		signal_id: "sig_test",
		title: "Test",
		category: "error",
		severity: 3,
		frequency: "once",
		impacted_components: [],
		suspected_root_cause: "",
		evidence_summary: "",
		stagnant: false,
		cycle_count: 0,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		...overrides,
	};
}

describe("selectGene", () => {
	it("selects repair gene for repair-only strategy", () => {
		const gene = selectGene(genes, [makeSignal()], "repair-only");
		expect(gene?.gene_id).toBe("gene_repair_minimal_v1");
	});

	it("selects harden gene for harden strategy", () => {
		const gene = selectGene(genes, [makeSignal()], "harden");
		expect(gene?.gene_id).toBe("gene_harden_tests_v1");
	});

	it("selects innovate gene for innovate strategy", () => {
		const gene = selectGene(genes, [makeSignal()], "innovate");
		expect(gene?.gene_id).toBe("gene_innovate_small_feature_v1");
	});

	it("returns null for empty gene list", () => {
		expect(selectGene([], [makeSignal()], "balanced")).toBeNull();
	});

	it("falls back to first gene when no match", () => {
		const customGenes = [{ ...genes[0]!, name: "custom_unmatched" }];
		const gene = selectGene(customGenes, [makeSignal()], "innovate");
		expect(gene).toBeTruthy();
	});
});
