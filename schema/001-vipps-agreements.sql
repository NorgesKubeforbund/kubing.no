CREATE TABLE IF NOT EXISTS agreements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    status VARCHAR(100) NOT NULL,
    vipps_reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS charges (
    id SERIAL PRIMARY KEY,
    agreement_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(100) NOT NULL,
    vipps_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_due DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE CASCADE
);
