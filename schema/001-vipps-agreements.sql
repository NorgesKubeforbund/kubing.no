ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;

DROP SEQUENCE IF EXISTS orders_id_seq;

CREATE TABLE IF NOT EXISTS agreements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    status VARCHAR(100) NOT NULL,
    vipps_reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS charges (
    id INTEGER PRIMARY KEY,
    agreement_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(100) NOT NULL,
    vipps_reference VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    payment_due DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE CASCADE,
    CONSTRAINT payment_due_required_unless_initial
        CHECK (type = 'INITIAL' OR payment_due IS NOT NULL)
);
