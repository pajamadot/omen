import { Hono } from "hono";
import type { Env } from "./types.js";
import { health } from "./routes/health.js";
import { signals } from "./routes/signals.js";
import { events } from "./routes/events.js";
import { genes } from "./routes/genes.js";
import { capsules } from "./routes/capsules.js";
import { persona } from "./routes/persona.js";
import { memory } from "./routes/memory.js";
import { evolve } from "./routes/evolve.js";
import { seed } from "./routes/seed.js";

export function createRouter(): Hono<{ Bindings: Env }> {
	const app = new Hono<{ Bindings: Env }>().basePath("/api");

	app.route("/", health);
	app.route("/", signals);
	app.route("/", events);
	app.route("/", genes);
	app.route("/", capsules);
	app.route("/", persona);
	app.route("/", memory);
	app.route("/", evolve);
	app.route("/", seed);

	return app;
}
