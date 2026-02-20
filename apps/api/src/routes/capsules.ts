import { Hono } from "hono";
import type { Env } from "../types.js";
import { createD1Adapter } from "../db/queries.js";

export const capsules = new Hono<{ Bindings: Env }>();

capsules.get("/capsules", async (c) => {
	const db = createD1Adapter(c.env.DB);
	const data = await db.getCapsules();
	return c.json({ data });
});
