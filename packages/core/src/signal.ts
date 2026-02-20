import type { Signal } from "./types.js";

let counter = 0;

export function createSignalId(): string {
	counter++;
	return `sig_${Date.now()}_${counter}`;
}

export function createSignal(partial: Omit<Signal, "signal_id" | "stagnant" | "cycle_count" | "created_at" | "updated_at">): Signal {
	const now = new Date().toISOString();
	return {
		signal_id: createSignalId(),
		stagnant: false,
		cycle_count: 0,
		created_at: now,
		updated_at: now,
		...partial,
	};
}

/**
 * Deduplicate signals by title + category.
 * If a signal already exists, bump its cycle_count and update frequency.
 */
export function deduplicateSignals(existing: Signal[], incoming: Signal[]): Signal[] {
	const map = new Map<string, Signal>();
	for (const s of existing) {
		map.set(`${s.category}::${s.title}`, s);
	}

	const results: Signal[] = [];
	for (const inc of incoming) {
		const key = `${inc.category}::${inc.title}`;
		const prev = map.get(key);
		if (prev) {
			results.push({
				...prev,
				cycle_count: prev.cycle_count + 1,
				severity: Math.max(prev.severity, inc.severity),
				evidence_summary: `${prev.evidence_summary}\n---\n${inc.evidence_summary}`,
				updated_at: new Date().toISOString(),
			});
		} else {
			results.push(inc);
		}
	}

	return results;
}

/**
 * Detect persistent signals that haven't been resolved across multiple cycles.
 */
export function markStagnant(signals: Signal[], threshold = 3): Signal[] {
	return signals.map((s) => ({
		...s,
		stagnant: s.cycle_count >= threshold,
	}));
}
