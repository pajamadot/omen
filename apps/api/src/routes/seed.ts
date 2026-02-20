import { Hono } from "hono";
import type { Env } from "../types.js";
import { bootstrapData } from "@omen/core";
import { createD1Adapter } from "../db/queries.js";

export const seed = new Hono<{ Bindings: Env }>();

seed.post("/seed", async (c) => {
	const db = createD1Adapter(c.env.DB);
	const result = await bootstrapData(db);
	return c.json(result);
});
