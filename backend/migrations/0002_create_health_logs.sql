-- Migration number: 0002
CREATE TABLE IF NOT EXISTS health_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,           -- YYYY-MM-DD
    steps INTEGER NOT NULL DEFAULT 0,
    calories_burned REAL NOT NULL DEFAULT 0,
    water_ml REAL NOT NULL DEFAULT 0,
    sleep_hours REAL NOT NULL DEFAULT 0,
    mood INTEGER NOT NULL DEFAULT 3,  -- 1=terrible, 5=great
    note TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_date ON health_logs (date);
