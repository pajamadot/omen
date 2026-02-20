"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/omen/card";
import { getGenes, getCapsules } from "@/lib/api";
import type { Gene, Capsule } from "@omen/core";

export default function RegistryPage() {
	const [genes, setGenes] = useState<Gene[]>([]);
	const [capsules, setCapsules] = useState<Capsule[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([getGenes(), getCapsules()])
			.then(([g, c]) => {
				setGenes(g.data);
				setCapsules(c.data);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <p className="animate-pulse text-omen-amber text-xs">Loading registry...</p>;
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-xl font-bold tracking-tight">Gene & Capsule Registry</h1>
				<p className="text-xs text-omen-muted">Reusable evolution strategies and policy modules</p>
			</div>

			{/* Genes */}
			<section>
				<h2 className="mb-3 text-sm font-semibold text-omen-amber">Genes</h2>
				{genes.length === 0 ? (
					<Card>
						<p className="text-xs text-omen-muted">No genes registered. Seed data first.</p>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{genes.map((gene) => (
							<Card key={gene.gene_id} glow="amber">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-bold text-omen-amber">{gene.name}</span>
									<span className="text-[9px] text-omen-muted">v{gene.version}</span>
								</div>
								<p className="font-mono text-[10px] text-zinc-500">{gene.gene_id}</p>

								<div className="mt-3 space-y-2">
									<div>
										<p className="text-[9px] font-semibold uppercase text-omen-muted">When to use</p>
										<div className="mt-1 flex flex-wrap gap-1">
											{gene.when_to_use.map((w) => (
												<span key={w} className="rounded bg-omen-bg px-1.5 py-0.5 text-[9px] text-zinc-400">
													{w}
												</span>
											))}
										</div>
									</div>

									<div>
										<p className="text-[9px] font-semibold uppercase text-omen-muted">Steps</p>
										<ol className="mt-1 space-y-0.5">
											{gene.steps.map((step, i) => (
												<li key={i} className="text-[10px] text-zinc-400">
													{i + 1}. {step}
												</li>
											))}
										</ol>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}
			</section>

			{/* Capsules */}
			<section>
				<h2 className="mb-3 text-sm font-semibold text-omen-purple">Capsules</h2>
				{capsules.length === 0 ? (
					<Card>
						<p className="text-xs text-omen-muted">No capsules registered. Seed data first.</p>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{capsules.map((cap) => (
							<Card key={cap.capsule_id} glow="purple">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-bold text-omen-purple">{cap.name}</span>
									<span className="text-[9px] text-omen-muted">v{cap.version}</span>
								</div>
								<p className="font-mono text-[10px] text-zinc-500">{cap.capsule_id}</p>
								<p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">{cap.content}</p>
								<div className="mt-2 flex flex-wrap gap-1">
									{cap.applies_to.map((a) => (
										<span key={a} className="rounded bg-omen-bg px-1.5 py-0.5 text-[9px] text-omen-purple/70">
											{a}
										</span>
									))}
								</div>
							</Card>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
