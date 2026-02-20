import { describe, it, expect } from "vitest";
import { detectStagnation } from "./anti-stagnation.js";
import { baselineGenes } from "./init.js";
import type { Signal } from "./types.js";

const genes = baselineGenes();

function makeSignal(stagnant: boolean): Signal {
	return {
		signal_id: `sig_${Math.random()}`,
		title: "Test",
		category: "error",
		severity: 3,
		frequency: "frequent",
		impacted_components: [],
		suspected_root_cause: "",
		evidence_summary: "",
		stagnant,
		cycle_count: stagnant ? 5 : 0,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
}

describe("detectStagnation", () => {
	it("returns no switch when no stagnant signals", () => {
		const result = detectStagnation([makeSignal(false)], "balanced", genes);
		expect(result.should_switch_strategy).toBe(false);
		expect(result.escalation_needed).toBe(false);
	});

	it("escalates when 3+ stagnant signals", () => {
		const signals = [makeSignal(true), makeSignal(true), makeSignal(true)];
		const result = detectStagnation(signals, "balanced", genes);
		expect(result.should_switch_strategy).toBe(true);
		expect(result.new_strategy).toBe("innovate");
		expect(result.escalation_needed).toBe(true);
	});

	it("rotates strategy for 1-2 stagnant signals", () => {
		const result = detectStagnation([makeSignal(true)], "repair-only", genes);
		expect(result.should_switch_strategy).toBe(true);
		expect(result.new_strategy).toBe("harden");
		expect(result.escalation_needed).toBe(false);
	});

	it("wraps around strategy rotation", () => {
		const result = detectStagnation([makeSignal(true)], "innovate", genes);
		expect(result.new_strategy).toBe("repair-only");
	});
});
