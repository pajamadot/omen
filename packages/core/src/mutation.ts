import type { Mutation, MutationType, RiskLevel, EvolveStrategy, MutationConstraints } from "./types.js";

const STRATEGY_TYPE_MAP: Record<EvolveStrategy, MutationType> = {
	"repair-only": "repair",
	harden: "harden",
	balanced: "repair",
	innovate: "innovate",
};

const DEFAULT_CONSTRAINTS: MutationConstraints = {
	max_files_touched: 6,
	max_lines_changed: 200,
	no_new_deps: true,
	no_external_network: true,
};

export function createMutationId(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `mut_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function createMutation(opts: {
	strategy: EvolveStrategy;
	intent: string;
	risk_level?: RiskLevel;
	rollback?: string;
	constraints?: Partial<MutationConstraints>;
}): Mutation {
	return {
		mutation_id: createMutationId(),
		type: STRATEGY_TYPE_MAP[opts.strategy],
		intent: opts.intent,
		constraints: { ...DEFAULT_CONSTRAINTS, ...opts.constraints },
		risk_level: opts.risk_level ?? "low",
		rollback: opts.rollback ?? "Revert all changed files to pre-mutation state",
	};
}
