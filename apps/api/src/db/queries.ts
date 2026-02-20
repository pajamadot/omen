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
} from "@omen/core";

/**
 * D1-backed implementation of DbAdapter.
 */
export function createD1Adapter(db: D1Database): DbAdapter {
	return {
		async getSignals(limit: number, offset: number): Promise<Signal[]> {
			const { results } = await db
				.prepare("SELECT * FROM signals ORDER BY updated_at DESC LIMIT ? OFFSET ?")
				.bind(limit, offset)
				.all();
			return (results ?? []).map(rowToSignal);
		},

		async insertSignal(signal: Signal): Promise<void> {
			await db
				.prepare(
					`INSERT INTO signals (signal_id, title, category, severity, frequency, impacted_components, suspected_root_cause, evidence_summary, stagnant, cycle_count, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					signal.signal_id,
					signal.title,
					signal.category,
					signal.severity,
					signal.frequency,
					JSON.stringify(signal.impacted_components),
					signal.suspected_root_cause,
					signal.evidence_summary,
					signal.stagnant ? 1 : 0,
					signal.cycle_count,
					signal.created_at,
					signal.updated_at,
				)
				.run();
		},

		async updateSignal(signal_id: string, updates: Partial<Signal>): Promise<void> {
			const sets: string[] = [];
			const values: unknown[] = [];

			if (updates.cycle_count !== undefined) {
				sets.push("cycle_count = ?");
				values.push(updates.cycle_count);
			}
			if (updates.stagnant !== undefined) {
				sets.push("stagnant = ?");
				values.push(updates.stagnant ? 1 : 0);
			}
			if (updates.updated_at !== undefined) {
				sets.push("updated_at = ?");
				values.push(updates.updated_at);
			}
			if (updates.severity !== undefined) {
				sets.push("severity = ?");
				values.push(updates.severity);
			}
			if (updates.evidence_summary !== undefined) {
				sets.push("evidence_summary = ?");
				values.push(updates.evidence_summary);
			}

			if (sets.length === 0) return;
			values.push(signal_id);

			await db.prepare(`UPDATE signals SET ${sets.join(", ")} WHERE signal_id = ?`).bind(...values).run();
		},

		async getEvents(limit: number, offset: number): Promise<EvolutionEvent[]> {
			const { results } = await db
				.prepare("SELECT * FROM events ORDER BY timestamp DESC LIMIT ? OFFSET ?")
				.bind(limit, offset)
				.all();
			return (results ?? []).map(rowToEvent);
		},

		async insertEvent(event: EvolutionEvent): Promise<void> {
			await db
				.prepare(
					`INSERT INTO events (event_id, timestamp, mutation, personality_state, selector_decision, signals, changes, validation, outcome)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					event.event_id,
					event.timestamp,
					JSON.stringify(event.mutation),
					JSON.stringify(event.personality_state),
					JSON.stringify(event.selector_decision),
					JSON.stringify(event.signals),
					JSON.stringify(event.changes),
					JSON.stringify(event.validation),
					JSON.stringify(event.outcome),
				)
				.run();
		},

		async getGenes(): Promise<Gene[]> {
			const { results } = await db.prepare("SELECT * FROM genes ORDER BY created_at").all();
			return (results ?? []).map(rowToGene);
		},

		async insertGene(gene: Gene): Promise<void> {
			await db
				.prepare(
					`INSERT INTO genes (gene_id, name, when_to_use, steps, constraints, validation, rollback, version, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					gene.gene_id,
					gene.name,
					JSON.stringify(gene.when_to_use),
					JSON.stringify(gene.steps),
					JSON.stringify(gene.constraints),
					JSON.stringify(gene.validation),
					gene.rollback,
					gene.version,
					gene.created_at,
				)
				.run();
		},

		async getCapsules(): Promise<Capsule[]> {
			const { results } = await db.prepare("SELECT * FROM capsules ORDER BY created_at").all();
			return (results ?? []).map(rowToCapsule);
		},

		async insertCapsule(capsule: Capsule): Promise<void> {
			await db
				.prepare(
					`INSERT INTO capsules (capsule_id, name, content, applies_to, version, created_at)
					 VALUES (?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					capsule.capsule_id,
					capsule.name,
					capsule.content,
					JSON.stringify(capsule.applies_to),
					capsule.version,
					capsule.created_at,
				)
				.run();
		},

		async getPersona(): Promise<PersonalityState | null> {
			const row = await db.prepare("SELECT * FROM persona WHERE id = 1").first();
			if (!row) return null;
			return {
				schema_version: row.schema_version as number,
				personality_id: row.personality_id as string,
				traits: JSON.parse(row.traits as string),
				recent_outcomes: JSON.parse(row.recent_outcomes as string),
				mutation_rule: row.mutation_rule as string,
			};
		},

		async upsertPersona(persona: PersonalityState): Promise<void> {
			await db
				.prepare(
					`INSERT INTO persona (id, schema_version, personality_id, traits, recent_outcomes, mutation_rule, updated_at)
					 VALUES (1, ?, ?, ?, ?, ?, ?)
					 ON CONFLICT(id) DO UPDATE SET
					   schema_version = excluded.schema_version,
					   personality_id = excluded.personality_id,
					   traits = excluded.traits,
					   recent_outcomes = excluded.recent_outcomes,
					   mutation_rule = excluded.mutation_rule,
					   updated_at = excluded.updated_at`,
				)
				.bind(
					persona.schema_version,
					persona.personality_id,
					JSON.stringify(persona.traits),
					JSON.stringify(persona.recent_outcomes),
					persona.mutation_rule,
					new Date().toISOString(),
				)
				.run();
		},

		async getEvolutionState(): Promise<EvolutionState | null> {
			const row = await db.prepare("SELECT * FROM evolution_state WHERE id = 1").first();
			if (!row) return null;
			return {
				current_cycle: row.current_cycle as number,
				last_cycle_timestamp: row.last_cycle_timestamp as string | null,
				evolve_strategy: row.evolve_strategy as EvolutionState["evolve_strategy"],
				review_mode: Boolean(row.review_mode),
				active_signals: JSON.parse((row.active_signals as string) ?? "[]"),
				stagnant_signals: JSON.parse((row.stagnant_signals as string) ?? "[]"),
			};
		},

		async upsertEvolutionState(state: EvolutionState): Promise<void> {
			await db
				.prepare(
					`INSERT INTO evolution_state (id, current_cycle, last_cycle_timestamp, evolve_strategy, review_mode, active_signals, stagnant_signals)
					 VALUES (1, ?, ?, ?, ?, ?, ?)
					 ON CONFLICT(id) DO UPDATE SET
					   current_cycle = excluded.current_cycle,
					   last_cycle_timestamp = excluded.last_cycle_timestamp,
					   evolve_strategy = excluded.evolve_strategy,
					   review_mode = excluded.review_mode,
					   active_signals = excluded.active_signals,
					   stagnant_signals = excluded.stagnant_signals`,
				)
				.bind(
					state.current_cycle,
					state.last_cycle_timestamp,
					state.evolve_strategy,
					state.review_mode ? 1 : 0,
					JSON.stringify(state.active_signals),
					JSON.stringify(state.stagnant_signals),
				)
				.run();
		},

		async getMemoryNodes(type?: MemoryNodeType, since?: string): Promise<MemoryNode[]> {
			let sql = "SELECT * FROM memory_graph";
			const conditions: string[] = [];
			const binds: unknown[] = [];

			if (type) {
				conditions.push("type = ?");
				binds.push(type);
			}
			if (since) {
				conditions.push("timestamp >= ?");
				binds.push(since);
			}

			if (conditions.length > 0) {
				sql += ` WHERE ${conditions.join(" AND ")}`;
			}
			sql += " ORDER BY timestamp DESC LIMIT 200";

			const { results } = await db.prepare(sql).bind(...binds).all();
			return (results ?? []).map(rowToMemoryNode);
		},

		async getMemoryChain(id: string): Promise<MemoryNode[]> {
			// Recursive CTE to follow parent chain
			const { results } = await db
				.prepare(
					`WITH RECURSIVE chain AS (
					   SELECT * FROM memory_graph WHERE id = ?
					   UNION ALL
					   SELECT mg.* FROM memory_graph mg
					   INNER JOIN chain c ON mg.id = c.parent_id
					 )
					 SELECT * FROM chain`,
				)
				.bind(id)
				.all();
			return (results ?? []).map(rowToMemoryNode);
		},

		async insertMemoryNode(node: MemoryNode): Promise<void> {
			await db
				.prepare(
					`INSERT INTO memory_graph (id, type, parent_id, timestamp, data, metadata)
					 VALUES (?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					node.id,
					node.type,
					node.parent_id,
					node.timestamp,
					JSON.stringify(node.data),
					node.metadata ? JSON.stringify(node.metadata) : null,
				)
				.run();
		},

		async getMegaPrompt(): Promise<{ version: number; content: string } | null> {
			const row = await db.prepare("SELECT * FROM mega_prompt ORDER BY version DESC LIMIT 1").first();
			if (!row) return null;
			return { version: row.version as number, content: row.content as string };
		},

		async insertMegaPrompt(content: string, changed_by?: string): Promise<void> {
			await db
				.prepare("INSERT INTO mega_prompt (content, changed_by, created_at) VALUES (?, ?, ?)")
				.bind(content, changed_by ?? null, new Date().toISOString())
				.run();
		},
	};
}

// ─── Row mappers ─────────────────────────────────────────────

function rowToSignal(row: Record<string, unknown>): Signal {
	return {
		signal_id: row.signal_id as string,
		title: row.title as string,
		category: row.category as string,
		severity: row.severity as number,
		frequency: row.frequency as string,
		impacted_components: JSON.parse((row.impacted_components as string) ?? "[]"),
		suspected_root_cause: row.suspected_root_cause as string,
		evidence_summary: row.evidence_summary as string,
		stagnant: Boolean(row.stagnant),
		cycle_count: row.cycle_count as number,
		created_at: row.created_at as string,
		updated_at: row.updated_at as string,
	};
}

function rowToEvent(row: Record<string, unknown>): EvolutionEvent {
	return {
		event_id: row.event_id as string,
		timestamp: row.timestamp as string,
		mutation: JSON.parse(row.mutation as string),
		personality_state: JSON.parse(row.personality_state as string),
		selector_decision: JSON.parse(row.selector_decision as string),
		signals: JSON.parse(row.signals as string),
		changes: JSON.parse(row.changes as string),
		validation: JSON.parse(row.validation as string),
		outcome: JSON.parse(row.outcome as string),
	};
}

function rowToGene(row: Record<string, unknown>): Gene {
	return {
		gene_id: row.gene_id as string,
		name: row.name as string,
		when_to_use: JSON.parse((row.when_to_use as string) ?? "[]"),
		steps: JSON.parse((row.steps as string) ?? "[]"),
		constraints: JSON.parse((row.constraints as string) ?? "{}"),
		validation: JSON.parse((row.validation as string) ?? "[]"),
		rollback: row.rollback as string,
		version: row.version as number,
		created_at: row.created_at as string,
	};
}

function rowToCapsule(row: Record<string, unknown>): Capsule {
	return {
		capsule_id: row.capsule_id as string,
		name: row.name as string,
		content: row.content as string,
		applies_to: JSON.parse((row.applies_to as string) ?? "[]"),
		version: row.version as number,
		created_at: row.created_at as string,
	};
}

function rowToMemoryNode(row: Record<string, unknown>): MemoryNode {
	return {
		id: row.id as string,
		type: row.type as MemoryNode["type"],
		parent_id: (row.parent_id as string) ?? null,
		timestamp: row.timestamp as string,
		data: JSON.parse((row.data as string) ?? "{}"),
		metadata: row.metadata ? JSON.parse(row.metadata as string) : null,
	};
}
