"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/omen/card";
import { MetricCard } from "@/components/omen/metric-card";
import { PersonalityRadar } from "@/components/omen/radar-chart";
import { getPersona, getSignals, getEvents, seedData, triggerEvolve, checkHealth } from "@/lib/api";
import { formatTimestamp, severityColor } from "@/lib/utils";
import type { PersonalityState, EvolutionState, Signal, EvolutionEvent } from "@omen/core";

export default function Dashboard() {
	const [persona, setPersona] = useState<PersonalityState | null>(null);
	const [state, setState] = useState<EvolutionState | null>(null);
	const [signals, setSignals] = useState<Signal[]>([]);
	const [events, setEvents] = useState<EvolutionEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionMsg, setActionMsg] = useState("");
	const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking");

	async function load() {
		try {
			const health = await checkHealth();
			setApiStatus(health.status === "ok" ? "connected" : "disconnected");
			const [p, s, e] = await Promise.all([
				getPersona(),
				getSignals(5),
				getEvents(5),
			]);
			setPersona(p.persona);
			setState(p.evolution_state);
			setSignals(s.data);
			setEvents(e.data);
		} catch {
			setApiStatus("disconnected");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(); }, []);

	async function handleSeed() {
		setActionMsg("Seeding...");
		const res = await seedData();
		setActionMsg(res.seeded ? "Seeded!" : "Already seeded");
		load();
	}

	async function handleEvolve() {
		setActionMsg("Running cycle...");
		await triggerEvolve();
		setActionMsg("Cycle complete!");
		load();
	}

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="animate-pulse text-omen-amber">Loading OMEN...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-xl font-bold tracking-tight">OMEN Dashboard</h1>
						<span className="flex items-center gap-1.5 rounded-full border border-omen-border px-2 py-0.5">
							<span className={`inline-block h-1.5 w-1.5 rounded-full ${
								apiStatus === "connected" ? "bg-omen-emerald status-pulse" :
								apiStatus === "checking" ? "bg-omen-amber status-pulse" :
								"bg-omen-red"
							}`} />
							<span className="text-[10px] text-omen-muted">
								{apiStatus === "connected" ? "API Connected" :
								 apiStatus === "checking" ? "Checking..." :
								 "API Offline"}
							</span>
						</span>
					</div>
					<p className="text-xs text-omen-muted">Protocol-constrained self-evolving agent</p>
				</div>
				<div className="flex items-center gap-2">
					{actionMsg && <span className="text-xs text-omen-amber">{actionMsg}</span>}
					<button
						onClick={handleSeed}
						className="rounded border border-omen-border px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
					>
						Seed Data
					</button>
					<button
						onClick={handleEvolve}
						className="rounded bg-omen-amber/20 border border-omen-amber/30 px-3 py-1.5 text-xs text-omen-amber transition hover:bg-omen-amber/30"
					>
						Run Cycle
					</button>
				</div>
			</div>

			{/* Metrics Row */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<MetricCard label="Cycle" value={state?.current_cycle ?? 0} glow="amber" />
				<MetricCard label="Strategy" value={state?.evolve_strategy ?? "—"} glow="blue" />
				<MetricCard
					label="Review Mode"
					value={state?.review_mode ? "ON" : "OFF"}
					glow={state?.review_mode ? "emerald" : undefined}
				/>
				<MetricCard label="Signals" value={signals.length} sub="active" glow="purple" />
			</div>

			{/* Personality + Signals */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card title="Personality State" glow="amber">
					{persona ? (
						<div className="flex items-center justify-center">
							<PersonalityRadar traits={persona.traits} size={220} />
						</div>
					) : (
						<p className="text-xs text-omen-muted">No persona data. Seed first.</p>
					)}
				</Card>

				<Card title="Recent Signals">
					{signals.length === 0 ? (
						<p className="text-xs text-omen-muted">No signals yet.</p>
					) : (
						<div className="space-y-2">
							{signals.map((s) => (
								<div key={s.signal_id} className="flex items-center gap-3 rounded border border-omen-border bg-omen-bg px-3 py-2">
									<span className={`text-xs font-bold ${severityColor(s.severity)}`}>
										S{s.severity}
									</span>
									<div className="flex-1 min-w-0">
										<p className="truncate text-xs text-zinc-200">{s.title}</p>
										<p className="text-[10px] text-omen-muted">{s.category}</p>
									</div>
									{s.stagnant && (
										<span className="text-[9px] rounded bg-omen-red/20 px-1.5 py-0.5 text-omen-red">
											STAGNANT
										</span>
									)}
								</div>
							))}
						</div>
					)}
				</Card>
			</div>

			{/* Recent Events */}
			<Card title="Recent Evolution Events">
				{events.length === 0 ? (
					<p className="text-xs text-omen-muted">No events yet. Run a cycle.</p>
				) : (
					<div className="space-y-2">
						{events.map((e) => (
							<div key={e.event_id} className="rounded border border-omen-border bg-omen-bg px-3 py-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-mono text-omen-amber">{e.event_id}</span>
									<span className="text-[10px] text-omen-muted">{formatTimestamp(e.timestamp)}</span>
								</div>
								<p className="mt-1 text-xs text-zinc-300">{e.mutation.intent}</p>
								<div className="mt-1 flex gap-2">
									<span className="text-[9px] rounded bg-omen-blue/20 px-1.5 py-0.5 text-omen-blue">
										{e.mutation.type}
									</span>
									<span className={`text-[9px] rounded px-1.5 py-0.5 ${e.outcome.success ? "bg-omen-emerald/20 text-omen-emerald" : "bg-omen-red/20 text-omen-red"}`}>
										{e.outcome.success ? "PASS" : "FAIL"}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
}
