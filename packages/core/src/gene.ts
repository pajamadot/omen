import type { Gene, Signal, EvolveStrategy } from "./types.js";

/**
 * Select the best gene for the current signals and strategy.
 */
export function selectGene(genes: Gene[], signals: Signal[], strategy: EvolveStrategy): Gene | null {
	if (genes.length === 0) return null;

	const strategyToType: Record<EvolveStrategy, string> = {
		"repair-only": "repair",
		harden: "harden",
		balanced: "repair",
		innovate: "innovate",
	};

	const targetType = strategyToType[strategy];

	// First try to find a gene matching the strategy (case-insensitive, also check gene_id)
	const matched = genes.find((g) => {
		const haystack = `${g.name} ${g.gene_id}`.toLowerCase();
		return haystack.includes(targetType);
	});
	if (matched) return matched;

	// If stagnant signals exist, try to find a different gene
	const hasStagnant = signals.some((s) => s.stagnant);
	if (hasStagnant) {
		const alternative = genes.find((g) => {
			const haystack = `${g.name} ${g.gene_id}`.toLowerCase();
			return !haystack.includes(targetType);
		});
		if (alternative) return alternative;
	}

	// Fallback to first gene
	return genes[0] ?? null;
}
