import { Hono } from "hono";
import type { Env } from "../types.js";
import { createD1Adapter } from "../db/queries.js";

export const persona = new Hono<{ Bindings: Env }>();

persona.get("/persona", async (c) => {
	const db = createD1Adapter(c.env.DB);
	const data = await db.getPersona();
	const state = await db.getEvolutionState();
	return c.json({ persona: data, evolution_state: state });
});
