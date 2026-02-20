import type { Signal, EvolveStrategy, Gene } from "./types.js";

export interface StagnationResult {
	should_switch_strategy: boolean;
	new_strategy?: EvolveStrategy;
	escalation_needed: boolean;
	reason: string;
}

/**
 * Detect stagnation and recommend strategy changes.
 */
export function detectStagnation(
	signals: Signal[],
	currentStrategy: EvolveStrategy,
	genes: Gene[],
): StagnationResult {
	const stagnant = signals.filter((s) => s.stagnant);

	if (stagnant.length === 0) {
		return { should_switch_strategy: false, escalation_needed: false, reason: "No stagnant signals" };
	}

	// If many stagnant signals, escalate
	if (stagnant.length >= 3) {
		return {
			should_switch_strategy: true,
			new_strategy: "innovate",
			escalation_needed: true,
			reason: `${stagnant.length} stagnant signals detected — escalating to innovate strategy and requesting human input`,
		};
	}

	// Try switching strategy
	const strategyRotation: EvolveStrategy[] = ["repair-only", "harden", "balanced", "innovate"];
	const currentIdx = strategyRotation.indexOf(currentStrategy);
	const nextStrategy = strategyRotation[(currentIdx + 1) % strategyRotation.length]!;

	return {
		should_switch_strategy: true,
		new_strategy: nextStrategy,
		escalation_needed: false,
		reason: `${stagnant.length} stagnant signal(s) — rotating strategy from ${currentStrategy} to ${nextStrategy}`,
	};
}
