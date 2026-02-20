import type { Gene, Capsule, EvolutionState, DbAdapter } from "./types.js";
import { createBaselinePersonality } from "./personality.js";

export function baselineGenes(): Gene[] {
	const now = new Date().toISOString();
	return [
		{
			gene_id: "gene_repair_minimal_v1",
			name: "Minimal Repair",
			when_to_use: ["error detected", "test failure", "runtime exception"],
			steps: [
				"Identify failing component",
				"Isolate root cause from signals",
				"Apply smallest possible fix",
				"Validate with existing tests",
			],
			constraints: { max_files: 3, max_lines: 50 },
			validation: ["npm test", "node --check"],
			rollback: "Revert changed files to pre-fix state",
			version: 1,
			created_at: now,
		},
		{
			gene_id: "gene_harden_tests_v1",
			name: "Harden Tests",
			when_to_use: ["missing test coverage", "flaky test", "regression risk"],
			steps: [
				"Identify uncovered code paths",
				"Write targeted test cases",
				"Ensure existing tests still pass",
				"Document test rationale",
			],
			constraints: { max_files: 4, test_only: true },
			validation: ["npm test"],
			rollback: "Remove added test files",
			version: 1,
			created_at: now,
		},
		{
			gene_id: "gene_optimize_hotpath_v1",
			name: "Optimize Hot Path",
			when_to_use: ["performance degradation", "slow response", "high latency"],
			steps: [
				"Profile to identify bottleneck",
				"Apply targeted optimization",
				"Benchmark before and after",
				"Validate no behavior change",
			],
			constraints: { max_files: 2, no_api_changes: true },
			validation: ["npm test", "node --check"],
			rollback: "Revert optimization changes",
			version: 1,
			created_at: now,
		},
		{
			gene_id: "gene_innovate_small_feature_v1",
			name: "Innovate Small Feature",
			when_to_use: ["feature gap", "user request", "capability enhancement"],
			steps: [
				"Define minimal feature scope",
				"Implement with existing patterns",
				"Add tests for new behavior",
				"Document the addition",
			],
			constraints: { max_files: 6, max_lines: 200 },
			validation: ["npm test"],
			rollback: "Remove new feature files and revert modified files",
			version: 1,
			created_at: now,
		},
	];
}

export function baselineCapsules(): Capsule[] {
	const now = new Date().toISOString();
	return [
		{
			capsule_id: "cap_logging_v1",
			name: "Structured Logging",
			content:
				"All operations must emit structured log entries with timestamp, operation, status, and context fields. Use JSON format for machine readability.",
			applies_to: ["runtime", "api", "worker"],
			version: 1,
			created_at: now,
		},
		{
			capsule_id: "cap_redaction_v1",
			name: "Secret Redaction",
			content:
				"Before any output or logging, scan for patterns matching API keys, tokens, passwords, and credentials. Replace with [REDACTED]. Never include raw secrets in evolution events.",
			applies_to: ["logging", "events", "output"],
			version: 1,
			created_at: now,
		},
		{
			capsule_id: "cap_rollback_v1",
			name: "Rollback Protocol",
			content:
				"Every mutation must record a rollback plan before applying changes. On validation failure, automatically execute rollback. Preserve rollback artifacts in events table.",
			applies_to: ["mutations", "patches", "deployments"],
			version: 1,
			created_at: now,
		},
	];
}

export function baselineEvolutionState(): EvolutionState {
	return {
		current_cycle: 0,
		last_cycle_timestamp: null,
		evolve_strategy: "balanced",
		review_mode: true, // Force REVIEW_MODE=true for first 3 cycles
		active_signals: [],
		stagnant_signals: [],
	};
}

/**
 * Bootstrap all initial data into the database.
 * Idempotent — skips if persona already exists.
 */
export async function bootstrapData(db: DbAdapter): Promise<{ seeded: boolean }> {
	const existing = await db.getPersona();
	if (existing) {
		return { seeded: false };
	}

	const persona = createBaselinePersonality();
	await db.upsertPersona(persona);

	const state = baselineEvolutionState();
	await db.upsertEvolutionState(state);

	for (const gene of baselineGenes()) {
		await db.insertGene(gene);
	}
	for (const capsule of baselineCapsules()) {
		await db.insertCapsule(capsule);
	}

	return { seeded: true };
}
