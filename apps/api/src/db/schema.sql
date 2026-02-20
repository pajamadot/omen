-- OMEN D1 Database Schema
-- Append-only evolution memory graph
CREATE TABLE IF NOT EXISTS memory_graph (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('signal','hypothesis','attempt','outcome')),
  parent_id TEXT,
  timestamp TEXT NOT NULL,
  data TEXT NOT NULL,
  metadata TEXT,
  FOREIGN KEY (parent_id) REFERENCES memory_graph(id)
);
CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_graph(type);
CREATE INDEX IF NOT EXISTS idx_memory_parent ON memory_graph(parent_id);
CREATE INDEX IF NOT EXISTS idx_memory_ts ON memory_graph(timestamp);

-- Signals extracted from runtime history
CREATE TABLE IF NOT EXISTS signals (
  signal_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 0,
  frequency TEXT,
  impacted_components TEXT,
  suspected_root_cause TEXT,
  evidence_summary TEXT,
  stagnant INTEGER DEFAULT 0,
  cycle_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Reusable evolution strategies
CREATE TABLE IF NOT EXISTS genes (
  gene_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  when_to_use TEXT,
  steps TEXT,
  constraints TEXT,
  validation TEXT,
  rollback TEXT,
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Reusable patch/policy modules
CREATE TABLE IF NOT EXISTS capsules (
  capsule_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  applies_to TEXT,
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Evolution events ledger (append-only)
CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  mutation TEXT NOT NULL,
  personality_state TEXT NOT NULL,
  selector_decision TEXT NOT NULL,
  signals TEXT NOT NULL,
  changes TEXT NOT NULL,
  validation TEXT NOT NULL,
  outcome TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(timestamp);

-- Current personality state (single row)
CREATE TABLE IF NOT EXISTS persona (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  schema_version INTEGER DEFAULT 1,
  personality_id TEXT NOT NULL,
  traits TEXT NOT NULL,
  recent_outcomes TEXT NOT NULL,
  mutation_rule TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Evolution state tracking (single row)
CREATE TABLE IF NOT EXISTS evolution_state (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  current_cycle INTEGER DEFAULT 0,
  last_cycle_timestamp TEXT,
  evolve_strategy TEXT DEFAULT 'balanced',
  review_mode INTEGER DEFAULT 1,
  active_signals TEXT,
  stagnant_signals TEXT
);

-- Mega-prompt versions (append-only)
CREATE TABLE IF NOT EXISTS mega_prompt (
  version INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  changed_by TEXT,
  created_at TEXT NOT NULL
);
