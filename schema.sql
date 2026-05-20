CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status INTEGER NOT NULL,
  ip TEXT NOT NULL,
  source TEXT NOT NULL,
  noisy INTEGER NOT NULL,
  location TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);

CREATE TABLE IF NOT EXISTS vault_files (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vault_timestamp ON vault_files(timestamp DESC);

CREATE TABLE IF NOT EXISTS geo_cache (
  ip TEXT PRIMARY KEY,
  org TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS status_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  battery INTEGER NOT NULL,
  charging INTEGER NOT NULL,
  signal INTEGER NOT NULL,
  temperature TEXT NOT NULL,
  uptime TEXT NOT NULL,
  ip TEXT NOT NULL,
  location TEXT NOT NULL,
  extra_data TEXT,
  command TEXT
);
CREATE INDEX IF NOT EXISTS idx_status_timestamp ON status_logs(timestamp DESC);

CREATE TABLE IF NOT EXISTS command_schedules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  command     TEXT NOT NULL,
  params      TEXT,
  target_time INTEGER NOT NULL,
  status      TEXT DEFAULT 'PENDING',
  secret_key  TEXT,
  log_output  TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_schedule_target ON command_schedules(target_time ASC);
