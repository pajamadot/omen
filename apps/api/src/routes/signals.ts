import { Hono } from "hono";
import type { Env } from "../types.js";
import { createD1Adapter } from "../db/queries.js";

export const signals = new Hono<{ Bindings: Env }>();

signals.get("/signals", async (c) => {
	const limit = Number(c.req.query("limit") ?? "50");
	const offset = Number(c.req.query("offset") ?? "0");
	const db = createD1Adapter(c.env.DB);
	const data = await db.getSignals(limit, offset);
	return c.json({ data, limit, offset });
});
