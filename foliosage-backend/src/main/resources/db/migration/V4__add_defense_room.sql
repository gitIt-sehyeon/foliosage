CREATE TABLE IF NOT EXISTS portfolio_defense_sessions (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id               UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    status                     VARCHAR(20) NOT NULL,
    vaultsage_conversation_id  VARCHAR(128),
    vaultsage_session_id       VARCHAR(128) NOT NULL,
    questions_json             TEXT NOT NULL,
    scorecard_json             TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at               TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS portfolio_defense_turns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES portfolio_defense_sessions(id) ON DELETE CASCADE,
    question_index  INT NOT NULL,
    question        TEXT NOT NULL,
    answer          TEXT,
    feedback        TEXT,
    evidence_json   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answered_at     TIMESTAMPTZ,
    CONSTRAINT uq_defense_turn_session_index UNIQUE (session_id, question_index)
);

CREATE INDEX IF NOT EXISTS idx_defense_sessions_portfolio ON portfolio_defense_sessions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_defense_turns_session ON portfolio_defense_turns(session_id);
