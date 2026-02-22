CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    wca_user_id INTEGER UNIQUE NOT NULL,
    wca_id VARCHAR(10) UNIQUE,
    email VARCHAR(150) UNIQUE NOT NULL,
    dob VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id INTEGER,
    refresh_token_hash VARCHAR(1000) UNIQUE NOT NULL,

    wca_access_token VARCHAR(1000) NOT NULL,
    wca_refresh_token VARCHAR(1000) NOT NULL,
    wca_user_id INTEGER NOT NULL,
    wca_scope VARCHAR(100) NOT NULL,
    wca_access_token_expires_at TIMESTAMPTZ NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    last_access TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
