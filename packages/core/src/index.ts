// Types
export type {
	Signal,
	Mutation,
	MutationType,
	RiskLevel,
	MutationConstraints,
	PersonalityState,
	PersonalityTraits,
	Gene,
	Capsule,
	SelectorDecision,
	EvolutionEvent,
	MemoryNode,
	MemoryNodeType,
	EvolutionState,
	EvolveStrategy,
	PatchPlan,
	CycleOutput,
	DbAdapter,
} from "./types.js";

// Signal
export { createSignal, createSignalId, deduplicateSignals, markStagnant } from "./signal.js";

// Gene
export { selectGene } from "./gene.js";

// Capsule
export { selectCapsules } from "./capsule.js";

// Mutation
export { createMutation, createMutationId } from "./mutation.js";

// Personality
export { evolvePersonality, createBaselinePersonality } from "./personality.js";

// Memory Graph
export { createMemoryNode, createMemoryNodeId, buildChain } from "./memory-graph.js";

// Anti-stagnation
export { detectStagnation } from "./anti-stagnation.js";
export type { StagnationResult } from "./anti-stagnation.js";

// Validator
export { validateCommand, validateCommands } from "./validator.js";
export type { ValidationResult } from "./validator.js";

// Init
export { baselineGenes, baselineCapsules, baselineEvolutionState, bootstrapData } from "./init.js";

// Evolution Loop
export { runEvolutionCycle } from "./evolution-loop.js";
