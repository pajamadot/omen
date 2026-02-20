import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: string): string {
	return new Date(ts).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function severityColor(severity: number): string {
	if (severity >= 8) return "text-omen-red";
	if (severity >= 5) return "text-omen-amber";
	if (severity >= 3) return "text-omen-blue";
	return "text-omen-emerald";
}

export function traitToPercent(value: number): number {
	return Math.round(value * 100);
}
