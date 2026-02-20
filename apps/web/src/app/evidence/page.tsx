"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/omen/card";
import { getEvents, getMemoryChain } from "@/lib/api";
import { formatTimestamp } from "@/lib/utils";
import type { EvolutionEvent, MemoryNode } from "@omen/core";

export default function EvidencePage() {
	const [events, setEvents] = useState<EvolutionEvent[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<EvolutionEvent | null>(null);
	const [chain, setChain] = useState<MemoryNode[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getEvents(20)
			.then((res) => setEvents(res.data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	async function selectEvent(event: EvolutionEvent) {
		setSelectedEvent(event);
		// Try to load memory chain for the first signal
		if (event.signals.length > 0) {
			try {
				const res = await getMemoryChain(event.signals[0]!.signal_id);
				setChain(res.chain);
			} catch {
				setChain([]);
			}
		}
	}

	if (loading) {
		return <p className="animate-pulse text-omen-amber text-xs">Loading evidence...</p>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-bold tracking-tight">Evidence Panel</h1>
				<p className="text-xs text-omen-muted">Evidence chains backing each evolution decision</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Event list */}
				<div className="lg:col-span-1 space-y-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-omen-muted mb-2">
						Events
					</p>
					{events.map((event) => (
						<button
							key={event.event_id}
							type="button"
							onClick={() => selectEvent(event)}
							className={`w-full text-left rounded border p-2 text-xs transition ${
								selectedEvent?.event_id === event.event_id
									? "border-omen-amber/50 bg-omen-amber/10"
									: "border-omen-border hover:border-zinc-600"
							}`}
						>
							<span className="font-mono text-[10px] text-omen-amber">{event.event_id}</span>
							<p className="mt-0.5 text-zinc-400 truncate">{event.mutation.intent}</p>
						</button>
					))}
				</div>

				{/* Evidence detail */}
				<div className="lg:col-span-2 space-y-4">
					{selectedEvent ? (
						<>
							<Card title="Decision Evidence" glow="amber">
								<div className="space-y-3">
									<div>
										<p className="text-[9px] uppercase text-omen-muted">Why this gene?</p>
										<p className="text-xs text-zinc-300">{selectedEvent.selector_decision.why}</p>
									</div>
									<div>
										<p className="text-[9px] uppercase text-omen-muted">Alternatives rejected</p>
										<p className="text-xs text-zinc-400">{selectedEvent.selector_decision.rejected_because}</p>
										<div className="mt-1 flex flex-wrap gap-1">
											{selectedEvent.selector_decision.alternatives_considered.map((a) => (
												<span key={a} className="rounded bg-omen-bg px-1.5 py-0.5 text-[9px] text-zinc-500">
													{a}
												</span>
											))}
										</div>
									</div>
								</div>
							</Card>

							<Card title="Signals Used">
								<div className="space-y-2">
									{selectedEvent.signals.map((s) => (
										<div key={s.signal_id} className="rounded border border-omen-border bg-omen-bg p-2">
											<div className="flex justify-between">
												<span className="text-xs text-zinc-200">{s.title}</span>
												<span className="text-[9px] text-omen-muted">severity:{s.severity}</span>
											</div>
											<p className="mt-0.5 text-[10px] text-zinc-500">{s.evidence_summary}</p>
										</div>
									))}
								</div>
							</Card>

							<Card title="Validation">
								<div className="flex items-center gap-2">
									<span className={`text-xs font-bold ${selectedEvent.validation.result === "pass" ? "text-omen-emerald" : "text-omen-red"}`}>
										{selectedEvent.validation.result.toUpperCase()}
									</span>
									<span className="text-[10px] text-omen-muted">
										{selectedEvent.validation.commands.length} commands
									</span>
								</div>
								{selectedEvent.validation.failures.length > 0 && (
									<div className="mt-2 space-y-1">
										{selectedEvent.validation.failures.map((f, i) => (
											<p key={i} className="text-[10px] text-omen-red">{f}</p>
										))}
									</div>
								)}
							</Card>

							{chain.length > 0 && (
								<Card title="Memory Chain">
									<div className="space-y-2">
										{chain.map((node) => (
											<div key={node.id} className="rounded border border-omen-border bg-omen-bg p-2">
												<span className="text-[9px] font-bold uppercase text-omen-amber">{node.type}</span>
												<p className="font-mono text-[9px] text-zinc-500">{node.id}</p>
												<p className="text-[10px] text-zinc-400">{formatTimestamp(node.timestamp)}</p>
											</div>
										))}
									</div>
								</Card>
							)}
						</>
					) : (
						<Card>
							<p className="text-xs text-omen-muted">Select an event to view its evidence chain.</p>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
