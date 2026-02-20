import type { PersonalityState, PersonalityTraits } from "./types.js";

const MAX_DELTA = 0.05;
const TRAIT_MIN = 0.0;
const TRAIT_MAX = 1.0;

function clamp(val: number): number {
	return Math.max(TRAIT_MIN, Math.min(TRAIT_MAX, Math.round(val * 100) / 100));
}

function adjustTrait(current: number, delta: number): number {
	const bounded = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, delta));
	return clamp(current + bounded);
}

export function evolvePersonality(
	current: PersonalityState,
	outcome: { success: boolean; was_slow: boolean; was_risky_innovation: boolean },
): PersonalityState {
	const traits: PersonalityTraits = { ...current.traits };

	if (!outcome.success) {
		// Failures → increase caution + thoroughness
		traits.caution = adjustTrait(traits.caution, 0.05);
		traits.thoroughness = adjustTrait(traits.thoroughness, 0.03);
		traits.speed = adjustTrait(traits.speed, -0.02);
	} else if (outcome.was_slow) {
		// Success but slow → slightly increase speed
		traits.speed = adjustTrait(traits.speed, 0.03);
		traits.thoroughness = adjustTrait(traits.thoroughness, -0.01);
	} else {
		// Clean success → slight creativity boost
		traits.creativity = adjustTrait(traits.creativity, 0.02);
	}

	if (outcome.was_risky_innovation && !outcome.success) {
		traits.creativity = adjustTrait(traits.creativity, -0.05);
	}

	const outcomes = [
		outcome.success ? "success" : "failure",
		...current.recent_outcomes.slice(0, 9),
	];

	return {
		...current,
		traits,
		recent_outcomes: outcomes,
	};
}

export function createBaselinePersonality(): PersonalityState {
	return {
		schema_version: 1,
		personality_id: "omen_persona_v1",
		traits: {
			caution: 0.7,
			thoroughness: 0.8,
			speed: 0.4,
			creativity: 0.3,
		},
		recent_outcomes: [],
		mutation_rule: "adjust traits by max ±0.05 per cycle",
	};
}
