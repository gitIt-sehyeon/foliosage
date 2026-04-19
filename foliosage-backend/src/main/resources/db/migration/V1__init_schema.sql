CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    bio           TEXT,
    vaultsage_token VARCHAR(500),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE portfolios (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title              VARCHAR(255) NOT NULL,
    description        TEXT,
    organizer_id       VARCHAR(100),
    share_code         VARCHAR(100) UNIQUE,
    vaultsage_share_id VARCHAR(100),
    is_published       BOOLEAN NOT NULL DEFAULT false,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE portfolio_files (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id      UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    vaultsage_file_id VARCHAR(100) NOT NULL,
    name              VARCHAR(255) NOT NULL,
    file_hash         VARCHAR(64) NOT NULL,
    file_size         BIGINT,
    mime_type         VARCHAR(100),
    certified_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE certificates (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id   UUID NOT NULL UNIQUE REFERENCES portfolio_files(id) ON DELETE CASCADE,
    pdf_path  VARCHAR(500),
    issued_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolios_user     ON portfolios(user_id);
CREATE INDEX idx_portfolio_files_pid ON portfolio_files(portfolio_id);
CREATE INDEX idx_certificates_file   ON certificates(file_id);
