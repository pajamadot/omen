"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: "/", label: "Dashboard", icon: "◆" },
	{ href: "/evolution", label: "Evolution", icon: "◈" },
	{ href: "/memory", label: "Memory", icon: "◇" },
	{ href: "/registry", label: "Registry", icon: "⬡" },
	{ href: "/evidence", label: "Evidence", icon: "◎" },
	{ href: "/lab", label: "Lab", icon: "⬢" },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="hidden w-56 shrink-0 border-r border-omen-border bg-omen-surface lg:flex lg:flex-col">
			<div className="flex h-14 items-center gap-2 border-b border-omen-border px-4">
				<span className="text-lg font-bold text-omen-amber omen-logo-glow">◆</span>
				<span className="text-sm font-bold tracking-widest text-zinc-200">OMEN</span>
				<span className="ml-auto text-[10px] text-omen-muted">v0.1</span>
			</div>
			<nav className="flex-1 space-y-1 p-3">
				{NAV_ITEMS.map((item) => {
					const active = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
								active
									? "bg-omen-amber/10 text-omen-amber"
									: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
							)}
						>
							<span className="text-sm">{item.icon}</span>
							{item.label}
						</Link>
					);
				})}
			</nav>
			<div className="border-t border-omen-border p-4">
				<p className="text-[10px] text-omen-muted">Self-evolving agent</p>
				<p className="text-[10px] text-omen-muted">Protocol-constrained</p>
			</div>
		</aside>
	);
}
