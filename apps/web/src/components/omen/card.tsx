import { cn } from "@/lib/utils";

interface CardProps {
	title?: string;
	glow?: "amber" | "emerald" | "blue" | "purple";
	className?: string;
	children: React.ReactNode;
}

export function Card({ title, glow, className, children }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border border-omen-border bg-omen-surface p-4",
				glow === "amber" && "glow-amber",
				glow === "emerald" && "glow-emerald",
				glow === "blue" && "glow-blue",
				glow === "purple" && "glow-purple",
				className,
			)}
		>
			{title && (
				<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-omen-muted">
					{title}
				</h3>
			)}
			{children}
		</div>
	);
}
