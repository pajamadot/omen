import { Hono } from "hono";
import type { Env } from "../types.js";

export const health = new Hono<{ Bindings: Env }>();

health.get("/health", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
