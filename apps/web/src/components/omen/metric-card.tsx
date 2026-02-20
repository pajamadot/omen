import { Card } from "./card";

interface MetricCardProps {
	label: string;
	value: string | number;
	sub?: string;
	glow?: "amber" | "emerald" | "blue" | "purple";
}

export function MetricCard({ label, value, sub, glow }: MetricCardProps) {
	return (
		<Card glow={glow} className="text-center">
			<p className="text-[10px] font-semibold uppercase tracking-widest text-omen-muted">{label}</p>
			<p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
			{sub && <p className="mt-0.5 text-[10px] text-omen-muted">{sub}</p>}
		</Card>
	);
}
