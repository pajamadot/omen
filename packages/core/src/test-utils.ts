import type {
	DbAdapter,
	Signal,
	EvolutionEvent,
	Gene,
	Capsule,
	PersonalityState,
	EvolutionState,
	MemoryNode,
	MemoryNodeType,
} from "./types.js";

/**
 * In-memory mock of DbAdapter for testing without D1.
 */
export function createMockAdapter(): DbAdapter {
	const signals: Signal[] = [];
	const events: EvolutionEvent[] = [];
	const genes: Gene[] = [];
	const capsules: Capsule[] = [];
	const memoryNodes: MemoryNode[] = [];
	const megaPrompts: { version: number; content: string; changed_by?: string }[] = [];
	let persona: PersonalityState | null = null;
	let evolutionState: EvolutionState | null = null;

	return {
		async getSignals(limit: number, offset: number) {
			return signals.slice(offset, offset + limit);
		},
		async insertSignal(signal: Signal) {
			signals.push(signal);
		},
		async updateSignal(signal_id: string, updates: Partial<Signal>) {
			const idx = signals.findIndex((s) => s.signal_id === signal_id);
			if (idx >= 0) {
				signals[idx] = { ...signals[idx]!, ...updates };
			}
		},
		async getEvents(limit: number, offset: number) {
			return events.slice(offset, offset + limit);
		},
		async insertEvent(event: EvolutionEvent) {
			events.push(event);
		},
		async getGenes() {
			return genes;
		},
		async insertGene(gene: Gene) {
			genes.push(gene);
		},
		async getCapsules() {
			return capsules;
		},
		async insertCapsule(capsule: Capsule) {
			capsules.push(capsule);
		},
		async getPersona() {
			return persona;
		},
		async upsertPersona(p: PersonalityState) {
			persona = p;
		},
		async getEvolutionState() {
			return evolutionState;
		},
		async upsertEvolutionState(state: EvolutionState) {
			evolutionState = state;
		},
		async getMemoryNodes(type?: MemoryNodeType, since?: string) {
			return memoryNodes.filter((n) => {
				if (type && n.type !== type) return false;
				if (since && n.timestamp < since) return false;
				return true;
			});
		},
		async getMemoryChain(id: string) {
			const chain: MemoryNode[] = [];
			let current = memoryNodes.find((n) => n.id === id);
			while (current) {
				chain.push(current);
				current = current.parent_id ? memoryNodes.find((n) => n.id === current!.parent_id) : undefined;
			}
			return chain;
		},
		async insertMemoryNode(node: MemoryNode) {
			memoryNodes.push(node);
		},
		async getMegaPrompt() {
			if (megaPrompts.length === 0) return null;
			const last = megaPrompts[megaPrompts.length - 1]!;
			return { version: last.version, content: last.content };
		},
		async insertMegaPrompt(content: string, changed_by?: string) {
			megaPrompts.push({ version: megaPrompts.length + 1, content, changed_by });
		},
	};
}
