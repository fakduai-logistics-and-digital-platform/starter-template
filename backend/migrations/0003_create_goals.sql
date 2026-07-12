-- Migration number: 0003
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,           -- steps | calories | water | sleep | weight
    title TEXT NOT NULL,
    target_value REAL NOT NULL,
    current_value REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    deadline TEXT NOT NULL,       -- YYYY-MM-DD
    status TEXT NOT NULL DEFAULT 'active',  -- active | completed | paused
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals (user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals (status);
