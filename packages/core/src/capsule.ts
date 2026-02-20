import type { Capsule, Signal } from "./types.js";

/**
 * Select 0-2 capsules relevant to the current signals.
 */
export function selectCapsules(capsules: Capsule[], signals: Signal[]): Capsule[] {
	if (capsules.length === 0) return [];

	const categories = new Set(signals.map((s) => s.category));
	const components = new Set(signals.flatMap((s) => s.impacted_components));

	const scored = capsules.map((c) => {
		let score = 0;
		for (const target of c.applies_to) {
			if (categories.has(target)) score += 2;
			if (components.has(target)) score += 1;
		}
		return { capsule: c, score };
	});

	return scored
		.filter((s) => s.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 2)
		.map((s) => s.capsule);
}
