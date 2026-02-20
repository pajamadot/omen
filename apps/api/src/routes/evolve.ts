import { Hono } from "hono";
import type { Env } from "../types.js";
import type { Signal } from "@omen/core";
import { runEvolutionCycle, createSignal } from "@omen/core";
import { createD1Adapter } from "../db/queries.js";

export const evolve = new Hono<{ Bindings: Env }>();

evolve.post("/evolve", async (c) => {
	try {
		const db = createD1Adapter(c.env.DB);
		const body = await c.req.json<{ signals?: Partial<Signal>[] }>().catch(() => ({ signals: [] as Partial<Signal>[] }));

		const incomingSignals = (body.signals ?? []).map((s: Partial<Signal>) =>
			createSignal({
				title: s.title ?? "Untitled signal",
				category: s.category ?? "general",
				severity: s.severity ?? 1,
				frequency: s.frequency ?? "once",
				impacted_components: s.impacted_components ?? [],
				suspected_root_cause: s.suspected_root_cause ?? "Unknown",
				evidence_summary: s.evidence_summary ?? "",
			}),
		);

		const result = await runEvolutionCycle(db, incomingSignals);
		return c.json({ cycle: result });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return c.json({ error: message }, 500);
	}
});
