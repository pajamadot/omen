import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types.js";
import { createRouter } from "./router.js";

const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: ["https://omen.ce1este.day", "http://localhost:3000", "https://omen-api.radiantclay.workers.dev"],
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type"],
	}),
);

app.route("/", createRouter());

// Root redirect
app.get("/", (c) => c.json({ name: "OMEN API", version: "0.1.0" }));

export default app;
