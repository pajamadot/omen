import { describe, it, expect } from "vitest";
import { validateCommand, validateCommands } from "./validator.js";

describe("validateCommand", () => {
	it("allows node commands", () => {
		expect(validateCommand("node --check index.js")).toEqual({ valid: true });
	});

	it("allows npm commands", () => {
		expect(validateCommand("npm test")).toEqual({ valid: true });
	});

	it("allows npx commands", () => {
		expect(validateCommand("npx vitest run")).toEqual({ valid: true });
	});

	it("rejects non-allowlisted prefixes", () => {
		const r = validateCommand("rm -rf /");
		expect(r.valid).toBe(false);
		expect(r.reason).toContain("not in allowlist");
	});

	it("rejects shell operators", () => {
		expect(validateCommand("node test.js | cat").valid).toBe(false);
		expect(validateCommand("node test.js; rm -rf /").valid).toBe(false);
		expect(validateCommand("node test.js & background").valid).toBe(false);
		expect(validateCommand("node test.js > output.txt").valid).toBe(false);
	});

	it("rejects command substitution", () => {
		expect(validateCommand("node $(whoami)").valid).toBe(false);
		expect(validateCommand("node `whoami`").valid).toBe(false);
	});

	it("rejects empty commands", () => {
		expect(validateCommand("").valid).toBe(false);
		expect(validateCommand("   ").valid).toBe(false);
	});
});

describe("validateCommands", () => {
	it("validates all commands", () => {
		expect(validateCommands(["npm test", "node --check"]).valid).toBe(true);
	});

	it("fails on first invalid command", () => {
		const r = validateCommands(["npm test", "curl evil.com", "node check"]);
		expect(r.valid).toBe(false);
		expect(r.reason).toContain("curl");
	});

	it("passes empty list", () => {
		expect(validateCommands([]).valid).toBe(true);
	});
});
