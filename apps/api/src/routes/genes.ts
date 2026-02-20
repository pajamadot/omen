import { Hono } from "hono";
import type { Env } from "../types.js";
import { createD1Adapter } from "../db/queries.js";

export const genes = new Hono<{ Bindings: Env }>();

genes.get("/genes", async (c) => {
	const db = createD1Adapter(c.env.DB);
	const data = await db.getGenes();
	return c.json({ data });
});
