import { describe, it, expect } from "vitest";
import { evolvePersonality, createBaselinePersonality } from "./personality.js";

describe("createBaselinePersonality", () => {
	it("returns cautious defaults", () => {
		const p = createBaselinePersonality();
		expect(p.traits.caution).toBe(0.7);
		expect(p.traits.thoroughness).toBe(0.8);
		expect(p.traits.speed).toBe(0.4);
		expect(p.traits.creativity).toBe(0.3);
		expect(p.recent_outcomes).toEqual([]);
		expect(p.schema_version).toBe(1);
	});
});

describe("evolvePersonality", () => {
	it("increases caution on failure", () => {
		const base = createBaselinePersonality();
		const evolved = evolvePersonality(base, {
			success: false,
			was_slow: false,
			was_risky_innovation: false,
		});

		expect(evolved.traits.caution).toBe(0.75);
		expect(evolved.traits.thoroughness).toBe(0.83);
		expect(evolved.recent_outcomes[0]).toBe("failure");
	});

	it("increases speed on slow success", () => {
		const base = createBaselinePersonality();
		const evolved = evolvePersonality(base, {
			success: true,
			was_slow: true,
			was_risky_innovation: false,
		});

		expect(evolved.traits.speed).toBe(0.43);
	});

	it("increases creativity on clean success", () => {
		const base = createBaselinePersonality();
		const evolved = evolvePersonality(base, {
			success: true,
			was_slow: false,
			was_risky_innovation: false,
		});

		expect(evolved.traits.creativity).toBe(0.32);
	});

	it("decreases creativity on risky innovation failure", () => {
		const base = createBaselinePersonality();
		const evolved = evolvePersonality(base, {
			success: false,
			was_slow: false,
			was_risky_innovation: true,
		});

		expect(evolved.traits.creativity).toBe(0.25);
	});

	it("never exceeds trait bounds [0, 1]", () => {
		const maxed = createBaselinePersonality();
		maxed.traits.caution = 0.98;
		maxed.traits.thoroughness = 0.99;

		const evolved = evolvePersonality(maxed, {
			success: false,
			was_slow: false,
			was_risky_innovation: false,
		});

		expect(evolved.traits.caution).toBeLessThanOrEqual(1.0);
		expect(evolved.traits.thoroughness).toBeLessThanOrEqual(1.0);
	});

	it("keeps history to 10 entries", () => {
		let persona = createBaselinePersonality();
		persona.recent_outcomes = Array(10).fill("success");

		persona = evolvePersonality(persona, { success: true, was_slow: false, was_risky_innovation: false });
		expect(persona.recent_outcomes).toHaveLength(10);
		expect(persona.recent_outcomes[0]).toBe("success");
	});
});
