import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				omen: {
					bg: "#09090b",
					surface: "#18181b",
					border: "#27272a",
					muted: "#71717a",
					amber: "#f59e0b",
					emerald: "#10b981",
					blue: "#3b82f6",
					purple: "#a855f7",
					red: "#ef4444",
				},
			},
			fontFamily: {
				mono: ["JetBrains Mono", "Fira Code", "monospace"],
			},
		},
	},
	plugins: [],
};

export default config;
