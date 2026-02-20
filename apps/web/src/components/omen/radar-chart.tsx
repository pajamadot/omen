"use client";

import type { PersonalityTraits } from "@omen/core";

interface RadarChartProps {
	traits: PersonalityTraits;
	size?: number;
}

export function PersonalityRadar({ traits, size = 200 }: RadarChartProps) {
	const cx = size / 2;
	const cy = size / 2;
	const radius = size * 0.38;
	const labels = Object.keys(traits) as (keyof PersonalityTraits)[];
	const colors: Record<keyof PersonalityTraits, string> = {
		caution: "#f59e0b",
		thoroughness: "#10b981",
		speed: "#3b82f6",
		creativity: "#a855f7",
	};

	const points = labels.map((label, i) => {
		const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
		const value = traits[label];
		return {
			label,
			x: cx + Math.cos(angle) * radius * value,
			y: cy + Math.sin(angle) * radius * value,
			lx: cx + Math.cos(angle) * (radius + 18),
			ly: cy + Math.sin(angle) * (radius + 18),
			color: colors[label],
		};
	});

	const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

	// Background rings
	const rings = [0.25, 0.5, 0.75, 1.0];

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			{/* Background rings */}
			{rings.map((r) => (
				<polygon
					key={r}
					points={labels
						.map((_, i) => {
							const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
							return `${cx + Math.cos(angle) * radius * r},${cy + Math.sin(angle) * radius * r}`;
						})
						.join(" ")}
					fill="none"
					stroke="#27272a"
					strokeWidth={1}
				/>
			))}
			{/* Axes */}
			{labels.map((_, i) => {
				const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
				return (
					<line
						key={`axis-${i}`}
						x1={cx}
						y1={cy}
						x2={cx + Math.cos(angle) * radius}
						y2={cy + Math.sin(angle) * radius}
						stroke="#27272a"
						strokeWidth={1}
					/>
				);
			})}
			{/* Data polygon */}
			<polygon points={polygon} fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth={1.5} />
			{/* Data points and labels */}
			{points.map((p) => (
				<g key={p.label}>
					<circle cx={p.x} cy={p.y} r={3} fill={p.color} />
					<text
						x={p.lx}
						y={p.ly}
						textAnchor="middle"
						dominantBaseline="central"
						fill="#a1a1aa"
						fontSize={9}
						fontFamily="monospace"
					>
						{p.label}
					</text>
					<text
						x={p.x}
						y={p.y - 8}
						textAnchor="middle"
						fill={p.color}
						fontSize={8}
						fontFamily="monospace"
					>
						{Math.round(traits[p.label] * 100)}%
					</text>
				</g>
			))}
		</svg>
	);
}
