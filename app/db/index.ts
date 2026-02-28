import { Pool, QueryResult } from "pg";
import { WCAOAuthTokenResponse, WCAProfileResponse } from "@/app/utils/response-types";
import { User } from "@/app/utils/types";

const pool = new Pool({
  database: process.env.POSTGRES_DB ?? "postgres",
  user: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "postgres",
  host: process.env.POSTGRES_HOST ?? "postgres",
  port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function query(text: string, params: any[]): Promise<QueryResult<any>> {
  return pool.query(text, params);
}

export async function saveSession(tokens: WCAOAuthTokenResponse, user: WCAProfileResponse, refreshTokenHash: string, sessionId: string, userId: number | null) {
  const res = await query(`
    INSERT INTO sessions (
    id,
    user_id,
    refresh_token_hash,
    wca_access_token,
    wca_refresh_token,
    wca_user_id,
    wca_scope,
    wca_access_token_expires_at,
    expires_at,
    last_access
    )
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());
    `,
    [
      sessionId,
      userId,
      refreshTokenHash,
      tokens.access_token,
      tokens.refresh_token,
      user.me.id,
      tokens.scope,
      new Date(tokens.created_at * 1000 + tokens.expires_in * 1000),
      new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 90)
    ]
  )
  return res.rowCount;
}

export async function updateSession(refreshTokenHash: string, newRefreshTokenHash: string): Promise<{ sessionId: string, userId: number | null }> {
  const sessionInfo = await query(`
    SELECT id, user_id
    FROM sessions
    WHERE refresh_token_hash = $1 AND last_access > $2 AND expires_at > NOW()
    `,
    [
      refreshTokenHash,
      new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7)
    ]
  )
  if (!sessionInfo.rowCount) {
    return Promise.reject("Could not find valid session");
  }
  const res = await query(`
    UPDATE sessions
    SET refresh_token_hash = $1, last_access = NOW()
    WHERE refresh_token_hash = $2
    `,
    [
      newRefreshTokenHash,
      refreshTokenHash,
    ]
  )
  if (!res.rowCount) {
    return Promise.reject("Could not update session");
  }
  const row = sessionInfo.rows.at(0);
  return { sessionId: row.id, userId: row.user_id };
}

export async function deleteSession(sessionId: string) {
  const res = await query(`
    DELETE FROM sessions
    WHERE id = $1
    `,
    [
      sessionId,
    ]
  )
  return res.rowCount;
}

export async function getUserIdFromWCAUserId(wcaUserId: number): Promise<number | null> {
  const res = await query(`
    SELECT id FROM users
    WHERE wca_user_id = $1
    `,
    [
      wcaUserId,
    ]
  )
  if (!res.rowCount) {
    return null;
  }
  const row = res.rows.at(0);
  return row.id as number;
}

export async function getWcaTokensFromSessionId(sessionId: string): Promise<{ accessToken: string, refreshToken: string }> {
  const res = await query(`
    SELECT wca_access_token, wca_refresh_token FROM sessions
    WHERE id = $1
    `,
    [
      sessionId,
    ]
  )
  if (!res.rowCount) {
    Promise.reject("No tokens from session ID");
  }
  const row = res.rows.at(0);
  return { accessToken: row.wca_access_token as string, refreshToken: row.wca_refresh_token as string };
}

export async function addUser(user: WCAProfileResponse) {
  const res = await query(`
    INSERT INTO users (
    name,
    wca_user_id,
    wca_id,
    email,
    dob,
    created_at
    )
    VALUES
    ($1, $2, $3, $4, $5, NOW())
    RETURNING id;
    `,
    [
      user.me.name,
      user.me.id,
      user.me.wca_id,
      user.me.email,
      user.me.dob,
    ]
  );
  const id = res.rows.at(0).id;
  await query(`
    UPDATE sessions
    SET user_id = $1, last_access = NOW()
    WHERE wca_user_id = $2
  `,
    [
      id,
      user.me.id,
    ]
  );
}

export async function getUser(userId: number): Promise<User> {
  const res = await query(`
    SELECT name, wca_id, email, dob FROM users
    WHERE id = $1
    `,
    [
      userId,
    ]
  )
  if (!res.rowCount) {
    return Promise.reject("Did not find user");
  }
  const row = res.rows.at(0);
  return {
    name: row.name,
    wcaId: row.wca_id,
    email: row.email,
    dob: row.dob,
  };
}

export async function isUserMemberInYear(userId: number, year: number): Promise<boolean> {
  const res = await query(`
    SELECT EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = $1 AND year = $2
    )
    `,
    [
      userId,
      year,
    ]
  )
  if (!res.rowCount) {
    return Promise.reject("Could not check if user is member");
  }
  return res.rows[0].exists as boolean;
}

export async function getOrderNumber(): Promise<number> {
  const res = await query("select nextval('order_number_idx');", [])
  if (!res.rowCount) {
    return Promise.reject("Could not get next order number.");
  }
  return res.rows[0].nextval as number;
}

export async function createOrder(userId: number, year: number, vippsReference: string): Promise<void> {
  const res = await query(`
    INSERT INTO orders
    (user_id, year, status, vipps_reference)
    VALUES
    ($1, $2, 'CREATED', $3)
    `,
    [
      userId,
      year,
      vippsReference,
    ]
  )
  if (!res.rowCount) {
    return Promise.reject("Could not create order");
  }
}

export async function getOrderByUserIdAndVippsReference(userId: number, vippsReference: string): Promise<{ year: number, id: number }> {
  const res = await query(`
    SELECT id, year
    FROM orders
    WHERE user_id = $1 AND vipps_reference = $2
    `,
    [
      userId,
      vippsReference,
    ]
  )
  if (!res.rowCount) {
    return Promise.reject("Could not get order");
  }
  const row = res.rows[0];
  return { year: row.year, id: row.id };
}

export async function addMember(userId: number, orderNumber: number, year: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(`
    UPDATE orders
    SET status = 'COMPLETED'
    WHERE id = $1;
    `,
      [
        orderNumber,
      ]
    )
    const res2 = await client.query(`
      INSERT INTO memberships
      (user_id, year)
      VALUES
      ($1, $2);
    `,
      [
        userId,
        year,
      ]
    )
    if (!res.rowCount || !res2.rowCount) {
      throw "Could not add member";
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}
