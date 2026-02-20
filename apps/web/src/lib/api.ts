import type {
	Signal,
	EvolutionEvent,
	Gene,
	Capsule,
	PersonalityState,
	EvolutionState,
	MemoryNode,
	MemoryNodeType,
	CycleOutput,
} from "@omen/core";

const API_URL = process.env.NEXT_PUBLIC_OMEN_API_URL ?? "https://api.ce1este.day";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
	return res.json() as Promise<T>;
}

export async function getSignals(limit = 50, offset = 0) {
	return fetchJson<{ data: Signal[]; limit: number; offset: number }>(
		`/api/signals?limit=${limit}&offset=${offset}`,
	);
}

export async function getEvents(limit = 20, offset = 0) {
	return fetchJson<{ data: EvolutionEvent[]; limit: number; offset: number }>(
		`/api/events?limit=${limit}&offset=${offset}`,
	);
}

export async function getGenes() {
	return fetchJson<{ data: Gene[] }>("/api/genes");
}

export async function getCapsules() {
	return fetchJson<{ data: Capsule[] }>("/api/capsules");
}

export async function getPersona() {
	return fetchJson<{ persona: PersonalityState | null; evolution_state: EvolutionState | null }>(
		"/api/persona",
	);
}

export async function getMemoryGraph(type?: MemoryNodeType, since?: string) {
	const params = new URLSearchParams();
	if (type) params.set("type", type);
	if (since) params.set("since", since);
	return fetchJson<{ data: MemoryNode[] }>(`/api/memory-graph?${params}`);
}

export async function getMemoryChain(id: string) {
	return fetchJson<{ chain: MemoryNode[] }>(`/api/memory-graph/${id}/chain`);
}

export async function triggerEvolve(signals?: Partial<Signal>[]) {
	return fetchJson<{ cycle: CycleOutput }>("/api/evolve", {
		method: "POST",
		body: JSON.stringify({ signals }),
	});
}

export async function seedData() {
	return fetchJson<{ seeded: boolean }>("/api/seed", { method: "POST" });
}

export async function getHealth() {
	return fetchJson<{ status: string; timestamp: string }>("/api/health");
}
