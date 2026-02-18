import { Pool, QueryResult } from "pg";

const pool = new Pool({
    database: process.env.POSTGRES_DB ?? "postgres",
    user: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "postgres",
    host: process.env.POSTGRES_HOST ?? "postgres",
    port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function query(text: string, params: string[]): Promise<QueryResult<any>> {
  return pool.query(text, params);
}
