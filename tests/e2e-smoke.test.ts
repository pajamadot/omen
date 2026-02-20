/**
 * E2E Smoke Tests for OMEN
 *
 * These tests hit the live deployed API and verify the full stack works.
 * Run against: api.ce1est.day (production) or localhost:8787 (local dev)
 *
 * Usage:
 *   OMEN_API_URL=https://api.ce1est.day npx vitest run tests/e2e-smoke.test.ts
 *   OMEN_API_URL=http://localhost:8787 npx vitest run tests/e2e-smoke.test.ts
 */
import { describe, it, expect, beforeAll } from "vitest";

const API = process.env.OMEN_API_URL ?? "http://localhost:8787";

async function api<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T }> {
	const res = await fetch(`${API}${path}`, {
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	const text = await res.text();
	let body: T;
	try {
		body = JSON.parse(text) as T;
	} catch {
		throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
	}
	return { status: res.status, body };
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("E2E Smoke: Health", () => {
	it("GET /api/health returns ok", async () => {
		const { status, body } = await api<{ status: string }>("/api/health");
		expect(status).toBe(200);
		expect(body.status).toBe("ok");
	});
});

describe("E2E Smoke: Seed & Bootstrap", () => {
	it("POST /api/seed bootstraps initial data", async () => {
		const { status, body } = await api<{ seeded: boolean }>("/api/seed", {
			method: "POST",
		});
		expect(status).toBe(200);
		// Either seeded=true (first run) or seeded=false (already seeded)
		expect(typeof body.seeded).toBe("boolean");
	});
});

describe("E2E Smoke: Data Endpoints", () => {
	beforeAll(async () => {
		// Ensure data is seeded
		await api("/api/seed", { method: "POST" });
	});

	it("GET /api/persona returns personality state", async () => {
		const { status, body } = await api<{ persona: unknown; evolution_state: unknown }>("/api/persona");
		expect(status).toBe(200);
		expect(body.persona).toBeTruthy();
		expect(body.evolution_state).toBeTruthy();
	});

	it("GET /api/genes returns baseline genes", async () => {
		const { status, body } = await api<{ data: unknown[] }>("/api/genes");
		expect(status).toBe(200);
		expect(body.data.length).toBeGreaterThanOrEqual(4);
	});

	it("GET /api/capsules returns baseline capsules", async () => {
		const { status, body } = await api<{ data: unknown[] }>("/api/capsules");
		expect(status).toBe(200);
		expect(body.data.length).toBeGreaterThanOrEqual(3);
	});

	it("GET /api/signals returns signal list", async () => {
		const { status, body } = await api<{ data: unknown[] }>("/api/signals");
		expect(status).toBe(200);
		expect(Array.isArray(body.data)).toBe(true);
	});

	it("GET /api/events returns event list", async () => {
		const { status, body } = await api<{ data: unknown[] }>("/api/events");
		expect(status).toBe(200);
		expect(Array.isArray(body.data)).toBe(true);
	});

	it("GET /api/memory-graph returns memory nodes", async () => {
		const { status, body } = await api<{ data: unknown[] }>("/api/memory-graph");
		expect(status).toBe(200);
		expect(Array.isArray(body.data)).toBe(true);
	});

	it("GET /api/memory-graph?type=signal filters by type", async () => {
		const { status, body } = await api<{ data: unknown[] }>("/api/memory-graph?type=signal");
		expect(status).toBe(200);
		expect(Array.isArray(body.data)).toBe(true);
	});
});

describe("E2E Smoke: Evolution Cycle", () => {
	beforeAll(async () => {
		await api("/api/seed", { method: "POST" });
	});

	it("POST /api/evolve runs a full cycle with no signals", async () => {
		const { status, body } = await api<{ cycle: { cycle_header: { cycle_number: number }; evolution_event: { outcome: { success: boolean } } } }>(
			"/api/evolve",
			{
				method: "POST",
				body: JSON.stringify({}),
			},
		);
		expect(status).toBe(200);
		expect(body.cycle.cycle_header.cycle_number).toBeGreaterThanOrEqual(1);
		expect(body.cycle.evolution_event.outcome.success).toBe(true);
	});

	it("POST /api/evolve runs a cycle with custom signals", async () => {
		await delay(1000); // Avoid D1 write contention with previous test
		const { status, body } = await api<{
			cycle: {
				cycle_header: { cycle_number: number };
				signals: { title: string }[];
				evolution_event: { outcome: { success: boolean } };
			};
		}>("/api/evolve", {
			method: "POST",
			body: JSON.stringify({
				signals: [
					{
						title: "E2E test signal",
						category: "testing",
						severity: 2,
						evidence_summary: "Automated E2E smoke test",
					},
				],
			}),
		});
		expect(status).toBe(200);
		expect(body.cycle.signals.length).toBeGreaterThanOrEqual(1);
		expect(body.cycle.evolution_event.outcome.success).toBe(true);
	});

	it("Events endpoint shows new events after evolve", async () => {
		const { body } = await api<{ data: { event_id: string }[] }>("/api/events?limit=1");
		expect(body.data.length).toBeGreaterThanOrEqual(1);
		expect(body.data[0]!.event_id).toMatch(/^ev_/);
	});

	it("Memory graph has entries after evolve", async () => {
		const { body } = await api<{ data: { type: string }[] }>("/api/memory-graph");
		expect(body.data.length).toBeGreaterThanOrEqual(1);
	});

	it("Persona traits evolve across cycles", async () => {
		await delay(1000); // Avoid D1 write contention
		const { body: before } = await api<{ persona: { traits: { creativity: number } } }>("/api/persona");
		const creativityBefore = before.persona.traits.creativity;

		await api("/api/evolve", { method: "POST", body: JSON.stringify({}) });

		const { body: after } = await api<{ persona: { traits: { creativity: number } } }>("/api/persona");
		// Creativity should increase on clean success
		expect(after.persona.traits.creativity).toBeGreaterThanOrEqual(creativityBefore);
	});
});
