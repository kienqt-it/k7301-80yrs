export const schemaSql = `
CREATE TABLE IF NOT EXISTS contributions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  code           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  amount         INTEGER NOT NULL,
  note           TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  source         TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'webhook')),
  bank_reference TEXT UNIQUE,
  reject_reason  TEXT,
  submitted_at   TEXT NOT NULL,
  confirmed_at   TEXT,
  confirmed_by   TEXT
);

CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_code ON contributions(code);

CREATE TABLE IF NOT EXISTS unmatched_transactions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_content    TEXT NOT NULL,
  amount         INTEGER NOT NULL,
  transaction_id TEXT UNIQUE,
  received_at    TEXT NOT NULL,
  linked_contribution_id INTEGER REFERENCES contributions(id)
);
`;
