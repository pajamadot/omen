import { Hono } from "hono";
import type { Env } from "../types.js";
import type { MemoryNodeType } from "@omen/core";
import { createD1Adapter } from "../db/queries.js";

export const memory = new Hono<{ Bindings: Env }>();

memory.get("/memory-graph", async (c) => {
	const type = c.req.query("type") as MemoryNodeType | undefined;
	const since = c.req.query("since");
	const db = createD1Adapter(c.env.DB);
	const data = await db.getMemoryNodes(type, since);
	return c.json({ data });
});

memory.get("/memory-graph/:id/chain", async (c) => {
	const id = c.req.param("id");
	const db = createD1Adapter(c.env.DB);
	const chain = await db.getMemoryChain(id);
	return c.json({ chain });
});
