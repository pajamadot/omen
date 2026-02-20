const ALLOWED_PREFIXES = ["node", "npm", "npx"];
const FORBIDDEN_CHARS = [";", "|", "&", ">", "<", "$(",  "`"];

export interface ValidationResult {
	valid: boolean;
	reason?: string;
}

/**
 * Validate a command against OMEN's allowlist rules.
 * - Must use only allowlisted prefixes: node, npm, npx
 * - No command substitution
 * - No shell operators
 */
export function validateCommand(command: string): ValidationResult {
	const trimmed = command.trim();
	if (!trimmed) {
		return { valid: false, reason: "Empty command" };
	}

	const firstWord = trimmed.split(/\s+/)[0]!;
	if (!ALLOWED_PREFIXES.includes(firstWord)) {
		return { valid: false, reason: `Command prefix "${firstWord}" not in allowlist: ${ALLOWED_PREFIXES.join(", ")}` };
	}

	for (const char of FORBIDDEN_CHARS) {
		if (trimmed.includes(char)) {
			return { valid: false, reason: `Forbidden character/sequence "${char}" in command` };
		}
	}

	return { valid: true };
}

/**
 * Validate all commands in a list. Returns first failure or success.
 */
export function validateCommands(commands: string[]): ValidationResult {
	for (const cmd of commands) {
		const result = validateCommand(cmd);
		if (!result.valid) return result;
	}
	return { valid: true };
}
