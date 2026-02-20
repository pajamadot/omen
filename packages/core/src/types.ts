// ─── Signal ────────────────────────────────────────────────
export interface Signal {
	signal_id: string;
	title: string;
	category: string;
	severity: number;
	frequency: string;
	impacted_components: string[];
	suspected_root_cause: string;
	evidence_summary: string;
	stagnant: boolean;
	cycle_count: number;
	created_at: string;
	updated_at: string;
}

// ─── Mutation ──────────────────────────────────────────────
export type MutationType = "repair" | "harden" | "optimize" | "innovate";
export type RiskLevel = "low" | "medium" | "high";

export interface MutationConstraints {
	max_files_touched: number;
	max_lines_changed: number;
	no_new_deps: boolean;
	no_external_network: boolean;
}

export interface Mutation {
	mutation_id: string;
	type: MutationType;
	intent: string;
	constraints: MutationConstraints;
	risk_level: RiskLevel;
	rollback: string;
}

// ─── Personality ───────────────────────────────────────────
export interface PersonalityTraits {
	caution: number;
	thoroughness: number;
	speed: number;
	creativity: number;
}

export interface PersonalityState {
	schema_version: number;
	personality_id: string;
	traits: PersonalityTraits;
	recent_outcomes: string[];
	mutation_rule: string;
}

// ─── Gene ──────────────────────────────────────────────────
export interface Gene {
	gene_id: string;
	name: string;
	when_to_use: string[];
	steps: string[];
	constraints: Record<string, unknown>;
	validation: string[];
	rollback: string;
	version: number;
	created_at: string;
}

// ─── Capsule ───────────────────────────────────────────────
export interface Capsule {
	capsule_id: string;
	name: string;
	content: string;
	applies_to: string[];
	version: number;
	created_at: string;
}

// ─── Selector Decision ────────────────────────────────────
export interface SelectorDecision {
	selected_gene_id: string;
	selected_capsule_ids: string[];
	signals_used: string[];
	why: string;
	alternatives_considered: string[];
	rejected_because: string;
}

// ─── Evolution Event ───────────────────────────────────────
export interface EvolutionEvent {
	event_id: string;
	timestamp: string;
	mutation: Mutation;
	personality_state: PersonalityState;
	selector_decision: SelectorDecision;
	signals: Signal[];
	changes: {
		files_touched: string[];
		diff_summary: string;
		blast_radius: string;
	};
	validation: {
		commands: string[];
		result: "pass" | "fail";
		failures: string[];
	};
	outcome: {
		success: boolean;
		user_impact: string;
		followups: string[];
	};
}

// ─── Memory Graph ──────────────────────────────────────────
export type MemoryNodeType = "signal" | "hypothesis" | "attempt" | "outcome";

export interface MemoryNode {
	id: string;
	type: MemoryNodeType;
	parent_id: string | null;
	timestamp: string;
	data: Record<string, unknown>;
	metadata: Record<string, unknown> | null;
}

// ─── Evolution State ───────────────────────────────────────
export type EvolveStrategy = "repair-only" | "harden" | "balanced" | "innovate";

export interface EvolutionState {
	current_cycle: number;
	last_cycle_timestamp: string | null;
	evolve_strategy: EvolveStrategy;
	review_mode: boolean;
	active_signals: string[];
	stagnant_signals: string[];
}

// ─── Patch Plan ────────────────────────────────────────────
export interface PatchPlan {
	scope: string;
	diff_summary: string;
	safety_analysis: string;
	validation_commands: string[];
	rollback_plan: string;
	expected_changes: string;
	blast_radius: string;
}

// ─── Cycle Output ──────────────────────────────────────────
export interface CycleOutput {
	cycle_header: {
		cycle_number: number;
		timestamp: string;
		strategy: EvolveStrategy;
	};
	signals: Signal[];
	selector_decision: SelectorDecision;
	patch_plan: PatchPlan;
	validation_plan: string[];
	rollback_plan: string;
	evolution_event: EvolutionEvent;
	blockers?: string[];
}

// ─── DB Adapter (abstraction for D1 or any SQL backend) ───
export interface DbAdapter {
	getSignals(limit: number, offset: number): Promise<Signal[]>;
	insertSignal(signal: Signal): Promise<void>;
	updateSignal(signal_id: string, updates: Partial<Signal>): Promise<void>;

	getEvents(limit: number, offset: number): Promise<EvolutionEvent[]>;
	insertEvent(event: EvolutionEvent): Promise<void>;

	getGenes(): Promise<Gene[]>;
	insertGene(gene: Gene): Promise<void>;

	getCapsules(): Promise<Capsule[]>;
	insertCapsule(capsule: Capsule): Promise<void>;

	getPersona(): Promise<PersonalityState | null>;
	upsertPersona(persona: PersonalityState): Promise<void>;

	getEvolutionState(): Promise<EvolutionState | null>;
	upsertEvolutionState(state: EvolutionState): Promise<void>;

	getMemoryNodes(type?: MemoryNodeType, since?: string): Promise<MemoryNode[]>;
	getMemoryChain(id: string): Promise<MemoryNode[]>;
	insertMemoryNode(node: MemoryNode): Promise<void>;

	getMegaPrompt(): Promise<{ version: number; content: string } | null>;
	insertMegaPrompt(content: string, changed_by?: string): Promise<void>;
}
