"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/omen/card";
import { getEvents } from "@/lib/api";
import { formatTimestamp } from "@/lib/utils";
import type { EvolutionEvent } from "@omen/core";

export default function EvolutionPage() {
	const [events, setEvents] = useState<EvolutionEvent[]>([]);
	const [expanded, setExpanded] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getEvents(50)
			.then((res) => setEvents(res.data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <p className="animate-pulse text-omen-amber">Loading evolution timeline...</p>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-bold tracking-tight">Evolution Timeline</h1>
				<p className="text-xs text-omen-muted">Append-only evolution event ledger</p>
			</div>

			{events.length === 0 ? (
				<Card>
					<p className="text-xs text-omen-muted">No evolution events yet. Run a cycle from the dashboard.</p>
				</Card>
			) : (
				<div className="relative border-l border-omen-border pl-6 space-y-4 ml-3">
					{events.map((event) => {
						const isExpanded = expanded === event.event_id;
						return (
							<div key={event.event_id} className="relative">
								{/* Timeline dot */}
								<div className="absolute -left-[30px] top-2 h-3 w-3 rounded-full border-2 border-omen-amber bg-omen-bg" />

								<button
									type="button"
									onClick={() => setExpanded(isExpanded ? null : event.event_id)}
									className="w-full text-left rounded-lg border border-omen-border bg-omen-surface p-4 transition hover:border-omen-amber/30"
								>
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs text-omen-amber">{event.event_id}</span>
										<span className="text-[10px] text-omen-muted">{formatTimestamp(event.timestamp)}</span>
									</div>
									<p className="mt-1 text-xs text-zinc-300">{event.mutation.intent}</p>
									<div className="mt-2 flex gap-2">
										<span className="text-[9px] rounded bg-omen-blue/20 px-1.5 py-0.5 text-omen-blue">
											{event.mutation.type}
										</span>
										<span className="text-[9px] rounded bg-omen-purple/20 px-1.5 py-0.5 text-omen-purple">
											risk:{event.mutation.risk_level}
										</span>
										<span className={`text-[9px] rounded px-1.5 py-0.5 ${event.outcome.success ? "bg-omen-emerald/20 text-omen-emerald" : "bg-omen-red/20 text-omen-red"}`}>
											{event.validation.result}
										</span>
									</div>
								</button>

								{isExpanded && (
									<div className="mt-2 rounded-lg border border-omen-border bg-omen-bg p-4 space-y-3">
										<Section label="Selector Decision">
											<p className="text-xs text-zinc-300">Gene: {event.selector_decision.selected_gene_id}</p>
											<p className="text-xs text-zinc-400">{event.selector_decision.why}</p>
										</Section>
										<Section label="Changes">
											<p className="text-xs text-zinc-300">{event.changes.diff_summary}</p>
											<p className="text-[10px] text-omen-muted">Blast radius: {event.changes.blast_radius}</p>
										</Section>
										<Section label="Personality">
											<div className="flex gap-4 text-xs">
												{Object.entries(event.personality_state.traits).map(([k, v]) => (
													<span key={k} className="text-zinc-400">
														{k}: <span className="text-zinc-200">{Math.round((v as number) * 100)}%</span>
													</span>
												))}
											</div>
										</Section>
										<Section label="Outcome">
											<p className="text-xs text-zinc-300">{event.outcome.user_impact}</p>
											{event.outcome.followups.length > 0 && (
												<ul className="mt-1 space-y-1">
													{event.outcome.followups.map((f, i) => (
														<li key={i} className="text-[10px] text-omen-amber">→ {f}</li>
													))}
												</ul>
											)}
										</Section>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="text-[10px] font-semibold uppercase tracking-wider text-omen-muted">{label}</p>
			<div className="mt-1">{children}</div>
		</div>
	);
}
