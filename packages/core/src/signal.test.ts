import { describe, it, expect } from "vitest";
import { createSignal, deduplicateSignals, markStagnant } from "./signal.js";

describe("createSignal", () => {
	it("creates a signal with defaults", () => {
		const signal = createSignal({
			title: "Test failure",
			category: "error",
			severity: 5,
			frequency: "frequent",
			impacted_components: ["api"],
			suspected_root_cause: "timeout",
			evidence_summary: "API returns 500",
		});

		expect(signal.signal_id).toMatch(/^sig_/);
		expect(signal.title).toBe("Test failure");
		expect(signal.stagnant).toBe(false);
		expect(signal.cycle_count).toBe(0);
		expect(signal.created_at).toBeTruthy();
	});
});

describe("deduplicateSignals", () => {
	it("merges signals with same category+title", () => {
		const existing = [
			createSignal({
				title: "Slow query",
				category: "performance",
				severity: 3,
				frequency: "occasional",
				impacted_components: ["db"],
				suspected_root_cause: "missing index",
				evidence_summary: "Query takes 2s",
			}),
		];
		existing[0]!.cycle_count = 1;

		const incoming = [
			createSignal({
				title: "Slow query",
				category: "performance",
				severity: 5,
				frequency: "frequent",
				impacted_components: ["db"],
				suspected_root_cause: "missing index",
				evidence_summary: "Query now takes 4s",
			}),
		];

		const result = deduplicateSignals(existing, incoming);
		expect(result).toHaveLength(1);
		expect(result[0]!.cycle_count).toBe(2);
		expect(result[0]!.severity).toBe(5); // takes max severity
		expect(result[0]!.evidence_summary).toContain("Query takes 2s");
		expect(result[0]!.evidence_summary).toContain("Query now takes 4s");
	});

	it("adds new signals that don't match existing", () => {
		const existing = [
			createSignal({
				title: "Old signal",
				category: "error",
				severity: 1,
				frequency: "once",
				impacted_components: [],
				suspected_root_cause: "",
				evidence_summary: "",
			}),
		];

		const incoming = [
			createSignal({
				title: "New signal",
				category: "feature",
				severity: 2,
				frequency: "once",
				impacted_components: [],
				suspected_root_cause: "",
				evidence_summary: "",
			}),
		];

		const result = deduplicateSignals(existing, incoming);
		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("New signal");
	});
});

describe("markStagnant", () => {
	it("marks signals stagnant when cycle_count >= threshold", () => {
		const signals = [
			{ ...createSignal({ title: "A", category: "a", severity: 1, frequency: "", impacted_components: [], suspected_root_cause: "", evidence_summary: "" }), cycle_count: 3 },
			{ ...createSignal({ title: "B", category: "b", severity: 1, frequency: "", impacted_components: [], suspected_root_cause: "", evidence_summary: "" }), cycle_count: 1 },
		];

		const result = markStagnant(signals, 3);
		expect(result[0]!.stagnant).toBe(true);
		expect(result[1]!.stagnant).toBe(false);
	});
});
