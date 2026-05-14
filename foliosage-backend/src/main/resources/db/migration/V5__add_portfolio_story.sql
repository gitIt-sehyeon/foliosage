CREATE TABLE IF NOT EXISTS portfolio_stories (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id                UUID NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
    summary                     TEXT,
    role                        TEXT,
    problem                     TEXT,
    solution                    TEXT,
    impact                      TEXT,
    evidence_highlights_json    TEXT,
    missing_proof_json          TEXT,
    interview_questions_json    TEXT,
    status                      VARCHAR(24) NOT NULL,
    error_message               TEXT,
    generated_at                TIMESTAMPTZ,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_stories_portfolio ON portfolio_stories(portfolio_id);
