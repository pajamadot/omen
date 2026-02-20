import { describe, it, expect } from "vitest";
import { createMutation, createMutationId } from "./mutation.js";

describe("createMutationId", () => {
	it("returns mut_ prefixed timestamp", () => {
		const id = createMutationId();
		expect(id).toMatch(/^mut_\d{8}_\d{6}$/);
	});
});

describe("createMutation", () => {
	it("creates mutation with defaults", () => {
		const m = createMutation({
			strategy: "balanced",
			intent: "Fix failing tests",
		});

		expect(m.mutation_id).toMatch(/^mut_/);
		expect(m.type).toBe("repair");
		expect(m.intent).toBe("Fix failing tests");
		expect(m.risk_level).toBe("low");
		expect(m.constraints.max_files_touched).toBe(6);
		expect(m.constraints.max_lines_changed).toBe(200);
		expect(m.constraints.no_new_deps).toBe(true);
	});

	it("maps strategy to mutation type", () => {
		expect(createMutation({ strategy: "repair-only", intent: "" }).type).toBe("repair");
		expect(createMutation({ strategy: "harden", intent: "" }).type).toBe("harden");
		expect(createMutation({ strategy: "balanced", intent: "" }).type).toBe("repair");
		expect(createMutation({ strategy: "innovate", intent: "" }).type).toBe("innovate");
	});

	it("allows custom constraints", () => {
		const m = createMutation({
			strategy: "balanced",
			intent: "",
			constraints: { max_files_touched: 2 },
		});
		expect(m.constraints.max_files_touched).toBe(2);
		expect(m.constraints.max_lines_changed).toBe(200); // default preserved
	});
});
