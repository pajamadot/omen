"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/omen/card";
import { getMemoryGraph } from "@/lib/api";
import { formatTimestamp } from "@/lib/utils";
import type { MemoryNode, MemoryNodeType } from "@omen/core";

const TYPE_COLORS: Record<MemoryNodeType, string> = {
	signal: "text-omen-amber border-omen-amber/30 bg-omen-amber/10",
	hypothesis: "text-omen-blue border-omen-blue/30 bg-omen-blue/10",
	attempt: "text-omen-purple border-omen-purple/30 bg-omen-purple/10",
	outcome: "text-omen-emerald border-omen-emerald/30 bg-omen-emerald/10",
};

const TYPE_FILTERS: (MemoryNodeType | "all")[] = ["all", "signal", "hypothesis", "attempt", "outcome"];

export default function MemoryPage() {
	const [nodes, setNodes] = useState<MemoryNode[]>([]);
	const [filter, setFilter] = useState<MemoryNodeType | "all">("all");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const type = filter === "all" ? undefined : filter;
		setLoading(true);
		getMemoryGraph(type)
			.then((res) => setNodes(res.data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [filter]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-bold tracking-tight">Memory Graph</h1>
				<p className="text-xs text-omen-muted">Signal → Hypothesis → Attempt → Outcome chains</p>
			</div>

			<div className="flex gap-2">
				{TYPE_FILTERS.map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setFilter(t)}
						className={`rounded px-3 py-1 text-xs transition ${
							filter === t
								? "bg-omen-amber/20 text-omen-amber border border-omen-amber/30"
								: "border border-omen-border text-zinc-400 hover:text-zinc-200"
						}`}
					>
						{t}
					</button>
				))}
			</div>

			{loading ? (
				<p className="animate-pulse text-omen-amber text-xs">Loading...</p>
			) : nodes.length === 0 ? (
				<Card>
					<p className="text-xs text-omen-muted">No memory nodes yet.</p>
				</Card>
			) : (
				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					{nodes.map((node) => (
						<div
							key={node.id}
							className={`rounded-lg border p-3 ${TYPE_COLORS[node.type]}`}
						>
							<div className="flex items-center justify-between">
								<span className="text-[9px] font-bold uppercase">{node.type}</span>
								<span className="text-[9px] opacity-60">{formatTimestamp(node.timestamp)}</span>
							</div>
							<p className="mt-1 font-mono text-[10px] opacity-70">{node.id}</p>
							{node.parent_id && (
								<p className="text-[9px] opacity-50">↑ {node.parent_id}</p>
							)}
							<div className="mt-2 text-xs">
								{Object.entries(node.data).map(([k, v]) => (
									<p key={k}>
										<span className="opacity-50">{k}:</span>{" "}
										<span className="text-zinc-100">{String(v)}</span>
									</p>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
