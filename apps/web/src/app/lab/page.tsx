"use client";

import { useState } from "react";
import { Card } from "@/components/omen/card";
import { triggerEvolve } from "@/lib/api";
import type { CycleOutput, Signal } from "@omen/core";

export default function LabPage() {
	const [signalInputs, setSignalInputs] = useState([
		{ title: "", category: "general", severity: 3, evidence_summary: "" },
	]);
	const [result, setResult] = useState<CycleOutput | null>(null);
	const [running, setRunning] = useState(false);
	const [step, setStep] = useState(0);

	function addSignal() {
		setSignalInputs((prev) => [
			...prev,
			{ title: "", category: "general", severity: 3, evidence_summary: "" },
		]);
	}

	function updateSignal(index: number, field: string, value: string | number) {
		setSignalInputs((prev) =>
			prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
		);
	}

	function removeSignal(index: number) {
		setSignalInputs((prev) => prev.filter((_, i) => i !== index));
	}

	async function runCycle() {
		setRunning(true);
		setStep(1);
		try {
			const signals = signalInputs
				.filter((s) => s.title.trim())
				.map((s) => ({
					title: s.title,
					category: s.category,
					severity: s.severity,
					evidence_summary: s.evidence_summary,
				}));

			// Animate through steps
			for (let i = 2; i <= 7; i++) {
				await new Promise((resolve) => setTimeout(resolve, 400));
				setStep(i);
			}

			const res = await triggerEvolve(signals as Partial<Signal>[]);
			setResult(res.cycle);
			setStep(8);
		} catch (err) {
			setStep(0);
		} finally {
			setRunning(false);
		}
	}

	const STEPS = [
		"",
		"A. Observing signals...",
		"B. Checking anti-stagnation...",
		"C. Selecting strategy...",
		"D. Building mutation...",
		"E. Evolving personality...",
		"F. Selecting gene + capsules...",
		"G. Creating patch plan...",
		"Complete!",
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-bold tracking-tight">Thinking Lab</h1>
				<p className="text-xs text-omen-muted">Interactive step-by-step evolution interface</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Input panel */}
				<div className="space-y-4">
					<Card title="Input Signals">
						<div className="space-y-3">
							{signalInputs.map((signal, i) => (
								<div key={i} className="rounded border border-omen-border bg-omen-bg p-3 space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-[10px] text-omen-muted">Signal {i + 1}</span>
										{signalInputs.length > 1 && (
											<button
												type="button"
												onClick={() => removeSignal(i)}
												className="text-[10px] text-omen-red hover:text-red-400"
											>
												remove
											</button>
										)}
									</div>
									<input
										type="text"
										placeholder="Signal title"
										value={signal.title}
										onChange={(e) => updateSignal(i, "title", e.target.value)}
										className="w-full rounded border border-omen-border bg-omen-surface px-2 py-1 text-xs text-zinc-200 outline-none focus:border-omen-amber/50"
									/>
									<div className="flex gap-2">
										<select
											value={signal.category}
											onChange={(e) => updateSignal(i, "category", e.target.value)}
											className="flex-1 rounded border border-omen-border bg-omen-surface px-2 py-1 text-xs text-zinc-300 outline-none"
										>
											<option value="general">general</option>
											<option value="error">error</option>
											<option value="performance">performance</option>
											<option value="security">security</option>
											<option value="feature">feature</option>
										</select>
										<input
											type="number"
											min={0}
											max={10}
											value={signal.severity}
											onChange={(e) => updateSignal(i, "severity", Number(e.target.value))}
											className="w-16 rounded border border-omen-border bg-omen-surface px-2 py-1 text-xs text-zinc-200 outline-none"
										/>
									</div>
									<textarea
										placeholder="Evidence summary"
										value={signal.evidence_summary}
										onChange={(e) => updateSignal(i, "evidence_summary", e.target.value)}
										className="w-full rounded border border-omen-border bg-omen-surface px-2 py-1 text-xs text-zinc-300 outline-none resize-none"
										rows={2}
									/>
								</div>
							))}
							<button
								type="button"
								onClick={addSignal}
								className="w-full rounded border border-dashed border-omen-border py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition"
							>
								+ Add Signal
							</button>
						</div>
					</Card>

					<button
						type="button"
						onClick={runCycle}
						disabled={running}
						className="w-full rounded bg-omen-amber/20 border border-omen-amber/30 py-2 text-sm font-semibold text-omen-amber transition hover:bg-omen-amber/30 disabled:opacity-50"
					>
						{running ? "Running..." : "Run Evolution Cycle"}
					</button>
				</div>

				{/* Steps + Result panel */}
				<div className="space-y-4">
					{step > 0 && (
						<Card title="Evolution Steps" glow="amber">
							<div className="space-y-1.5">
								{STEPS.slice(1).map((label, i) => {
									const stepNum = i + 1;
									const isActive = stepNum === step;
									const isDone = stepNum < step;
									return (
										<div
											key={i}
											className={`flex items-center gap-2 text-xs transition ${
												isActive
													? "text-omen-amber"
													: isDone
														? "text-omen-emerald"
														: "text-zinc-600"
											}`}
										>
											<span className="w-4 text-center">
												{isDone ? "✓" : isActive ? "▸" : "○"}
											</span>
											{label}
										</div>
									);
								})}
							</div>
						</Card>
					)}

					{result && (
						<>
							<Card title="Cycle Result" glow="emerald">
								<div className="space-y-2">
									<div className="flex justify-between text-xs">
										<span className="text-omen-muted">Cycle</span>
										<span className="text-zinc-200">#{result.cycle_header.cycle_number}</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-omen-muted">Strategy</span>
										<span className="text-omen-blue">{result.cycle_header.strategy}</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-omen-muted">Gene</span>
										<span className="text-omen-amber">{result.selector_decision.selected_gene_id}</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-omen-muted">Result</span>
										<span className={result.evolution_event.outcome.success ? "text-omen-emerald" : "text-omen-red"}>
											{result.evolution_event.outcome.success ? "SUCCESS" : "FAILURE"}
										</span>
									</div>
								</div>
							</Card>

							{result.blockers && result.blockers.length > 0 && (
								<Card title="Blockers" glow="amber">
									{result.blockers.map((b, i) => (
										<p key={i} className="text-xs text-omen-amber">{b}</p>
									))}
								</Card>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
