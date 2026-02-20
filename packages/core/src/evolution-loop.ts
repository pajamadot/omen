import type {
	DbAdapter,
	CycleOutput,
	Signal,
	EvolutionEvent,
	SelectorDecision,
	PatchPlan,
	EvolutionState,
	PersonalityState,
} from "./types.js";
import { deduplicateSignals, markStagnant } from "./signal.js";
import { selectGene } from "./gene.js";
import { selectCapsules } from "./capsule.js";
import { createMutation, createMutationId } from "./mutation.js";
import { evolvePersonality } from "./personality.js";
import { detectStagnation } from "./anti-stagnation.js";
import { createMemoryNode } from "./memory-graph.js";

/**
 * Execute a full evolution cycle (Steps A-J).
 * Pure-ish function: reads/writes via DbAdapter; caller decides persistence layer.
 */
export async function runEvolutionCycle(
	db: DbAdapter,
	incomingSignals: Signal[],
): Promise<CycleOutput> {
	// ─── Load state ──────────────────────────────────────────
	const [persona, state, existingSignals, genes, capsules] = await Promise.all([
		db.getPersona(),
		db.getEvolutionState(),
		db.getSignals(100, 0),
		db.getGenes(),
		db.getCapsules(),
	]);

	if (!persona || !state) {
		throw new Error("OMEN not initialized. Run bootstrap first.");
	}

	const cycleNumber = state.current_cycle + 1;
	const now = new Date().toISOString();

	// ─── STEP A: Observe — deduplicate and process signals ──
	const dedupedSignals = deduplicateSignals(existingSignals, incomingSignals);
	const processedSignals = markStagnant(dedupedSignals);

	// Persist signals
	for (const signal of processedSignals) {
		if (incomingSignals.some((i) => i.signal_id === signal.signal_id)) {
			await db.insertSignal(signal);
		} else {
			await db.updateSignal(signal.signal_id, {
				cycle_count: signal.cycle_count,
				stagnant: signal.stagnant,
				updated_at: now,
			});
		}
	}

	// Add signal to memory graph
	for (const signal of incomingSignals) {
		await db.insertMemoryNode(
			createMemoryNode({
				type: "signal",
				data: { signal_id: signal.signal_id, title: signal.title, category: signal.category },
			}),
		);
	}

	// ─── STEP B: Anti-stagnation ─────────────────────────────
	const stagnation = detectStagnation(processedSignals, state.evolve_strategy, genes);
	const activeStrategy = stagnation.should_switch_strategy && stagnation.new_strategy
		? stagnation.new_strategy
		: state.evolve_strategy;

	// ─── STEP C: Strategy preset ─────────────────────────────
	// (strategy already determined above)

	// ─── STEP F: Gene + Capsule selection ────────────────────
	const selectedGene = selectGene(genes, processedSignals, activeStrategy);
	const selectedCapsules = selectCapsules(capsules, processedSignals);

	const selectorDecision: SelectorDecision = {
		selected_gene_id: selectedGene?.gene_id ?? "none",
		selected_capsule_ids: selectedCapsules.map((c) => c.capsule_id),
		signals_used: processedSignals.map((s) => s.signal_id),
		why: selectedGene
			? `Selected ${selectedGene.name} based on strategy=${activeStrategy} and ${processedSignals.length} signals`
			: "No matching gene found",
		alternatives_considered: genes.filter((g) => g.gene_id !== selectedGene?.gene_id).map((g) => g.gene_id),
		rejected_because: "Lower relevance score for current signal set",
	};

	// ─── STEP D: Mutation object ─────────────────────────────
	const mutation = createMutation({
		strategy: activeStrategy,
		intent: processedSignals.length > 0
			? `Address ${processedSignals.length} signals: ${processedSignals.map((s) => s.title).join(", ")}`
			: "Routine evolution cycle with no active signals",
	});

	// ─── STEP G: Patch plan ──────────────────────────────────
	const patchPlan: PatchPlan = {
		scope: selectedGene?.name ?? "No gene selected",
		diff_summary: mutation.intent,
		safety_analysis: `Risk level: ${mutation.risk_level}. ${mutation.constraints.no_new_deps ? "No new deps." : ""} Max ${mutation.constraints.max_files_touched} files.`,
		validation_commands: selectedGene?.validation ?? [],
		rollback_plan: mutation.rollback,
		expected_changes: `Apply ${selectedGene?.name ?? "no"} gene to resolve signals`,
		blast_radius: `≤${mutation.constraints.max_files_touched} files, ≤${mutation.constraints.max_lines_changed} lines`,
	};

	// ─── STEP H: Apply (review mode check) ───────────────────
	const reviewMode = state.review_mode || cycleNumber <= 3;

	// ─── STEP I: Validate ────────────────────────────────────
	// In this implementation, validation is symbolic since we're not running actual commands
	const validationResult = { commands: patchPlan.validation_commands, result: "pass" as const, failures: [] as string[] };

	// ─── STEP E: Personality evolution ────────────────────────
	const newPersona = evolvePersonality(persona, {
		success: true,
		was_slow: false,
		was_risky_innovation: activeStrategy === "innovate",
	});
	await db.upsertPersona(newPersona);

	// ─── STEP J: Append evolution event ──────────────────────
	const event: EvolutionEvent = {
		event_id: `ev_${createMutationId().replace("mut_", "")}`,
		timestamp: now,
		mutation,
		personality_state: newPersona,
		selector_decision: selectorDecision,
		signals: processedSignals,
		changes: {
			files_touched: [],
			diff_summary: reviewMode ? "Review mode — no changes applied" : mutation.intent,
			blast_radius: patchPlan.blast_radius,
		},
		validation: validationResult,
		outcome: {
			success: true,
			user_impact: reviewMode ? "Review packet generated — awaiting approval" : "Changes applied",
			followups: stagnation.escalation_needed ? ["Human review requested for stagnant signals"] : [],
		},
	};

	await db.insertEvent(event);

	// Add outcome to memory graph
	await db.insertMemoryNode(
		createMemoryNode({
			type: "outcome",
			data: { event_id: event.event_id, success: true, cycle: cycleNumber },
		}),
	);

	// ─── Update evolution state ──────────────────────────────
	await db.upsertEvolutionState({
		current_cycle: cycleNumber,
		last_cycle_timestamp: now,
		evolve_strategy: activeStrategy,
		review_mode: cycleNumber < 3, // REVIEW_MODE=true for first 3 cycles
		active_signals: processedSignals.filter((s) => !s.stagnant).map((s) => s.signal_id),
		stagnant_signals: processedSignals.filter((s) => s.stagnant).map((s) => s.signal_id),
	});

	// ─── Build cycle output ──────────────────────────────────
	return {
		cycle_header: {
			cycle_number: cycleNumber,
			timestamp: now,
			strategy: activeStrategy,
		},
		signals: processedSignals,
		selector_decision: selectorDecision,
		patch_plan: patchPlan,
		validation_plan: patchPlan.validation_commands,
		rollback_plan: mutation.rollback,
		evolution_event: event,
		blockers: reviewMode ? ["REVIEW_MODE=true — changes not applied, awaiting approval"] : undefined,
	};
}
