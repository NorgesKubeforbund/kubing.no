import * as jose from "jose";
import { cookies } from "next/headers";
import { getClient, query } from "@/db";
import crypto, { UUID } from "crypto";
import { WCAOAuthTokenResponse, WCAProfileResponse } from "@/types/responses";
import { NextResponse } from "next/server";
import { getWCAUserInfo, refreshWCATokens } from "@/lib/wca-oauth";
import { Address, Auth, Maybe, RefreshToken, TokenCreation, Tokens, UpdateSessionRes, WCATokens } from "@/types";
import { getCurrentYear } from "@/lib/time";
import { addMembershipIfManuallyPaid } from "@/lib/membership";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const JWT_ALG = "HS256";
const ENCRYPTION_SECRET = process.env.TOKEN_ENCRYPTION_SECRET ?? "";
const ENCRYPTION_ALG = "aes-256-gcm";
export const SESSION_TOKEN_NAME = "SESSION";
export const REFRESH_TOKEN_NAME = "REFRESH";

async function getSessionToken(): Promise<Maybe<jose.JWTVerifyResult<jose.JWTPayload>>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_NAME)?.value;
  if (!token) {
    return { success: false };
  }
  try {
    const decoded = await jose.jwtVerify(token, JWT_SECRET);
    return { success: true, data: decoded };
  } catch {
    return { success: false };
  }
}

async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_NAME)?.value;
  return refreshToken ?? null;
}

function createSessionToken(sessionId: string, userId: number | null): Promise<string> {
  const payload: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (userId !== null) {
    payload.userId = userId;
  }
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setIssuer("https://kubing.no")
    .setAudience("https://kubing.no")
    .setSubject(sessionId)
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(ENCRYPTION_SECRET, "base64");
  const cipher = crypto.createCipheriv(ENCRYPTION_ALG, key, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return [encrypted, iv.toString("hex"), authTag.toString("hex")].join("|");
}

function decryptToken(encryptedToken: string): string {
  const [encrypted, iv, authTag] = encryptedToken.split("|");
  const key = Buffer.from(ENCRYPTION_SECRET, "base64");
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALG,
    key,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function decryptWCATokens(wcaTokens: WCATokens): WCATokens {
  const { accessToken, refreshToken, accessTokenExpiresAt } = wcaTokens;
  return {
    accessToken: decryptToken(accessToken),
    refreshToken: decryptToken(refreshToken),
    accessTokenExpiresAt,
  };
}

export async function createSession(wcaTokens: WCAOAuthTokenResponse, user: WCAProfileResponse): Promise<Tokens> {
  const sessionId = crypto.randomUUID();
  const refreshToken = generateRefreshToken();
  const encryptedWcaTokens = {
    ...wcaTokens,
    access_token: encryptToken(wcaTokens.access_token),
    refresh_token: encryptToken(wcaTokens.refresh_token),
  };
  const userId = await getUserIdFromWCAUserId(user.me.id);
  await saveSession(encryptedWcaTokens, user, refreshToken.hash, sessionId, userId);
  const sessionToken = await createSessionToken(sessionId, userId);
  return {
    sessionToken: sessionToken,
    refreshToken: refreshToken.plain,
  };
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateRefreshToken(): RefreshToken {
  const plain = crypto.randomBytes(16).toString("hex");
  const hash = hashToken(plain);
  return { plain: plain, hash: hash };
}

export async function updateTokens(refreshToken: string, forceUpdate: boolean, baseUrl?: string): Promise<TokenCreation> {
  const newRefreshToken = generateRefreshToken();
  const res = await updateSession(hashToken(refreshToken), newRefreshToken.hash, forceUpdate);
  if (!res.success) {
    return {
      success: false,
      error: res.error,
    };
  }
  const newSessionToken = await createSessionToken(res.sessionId, res.userId);
  if (baseUrl) {
    const isWCASessionValid = await checkWCASession(res.sessionId, baseUrl);
    if (!isWCASessionValid) {
      return {
        success: false,
        error: "expired",
      };
    }
  }
  return {
    success: true,
    tokens: {
      sessionToken: newSessionToken,
      refreshToken: newRefreshToken.plain,
    },
    sessionId: res.sessionId,
  };
}

export function setAuthCookies(res: NextResponse, tokens: Tokens) {
  res.cookies.set({
    name: SESSION_TOKEN_NAME,
    value: tokens.sessionToken,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(new Date().getTime() + 1000 * 60 * 20),
  });
  res.cookies.set({
    name: REFRESH_TOKEN_NAME,
    value: tokens.refreshToken,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
  });
}

export async function createUser(sessionId: string, baseUrl: string, address: Address | null): Promise<boolean> {
  const wcaTokens = await getValidWcaTokens(sessionId, baseUrl);
  if (!wcaTokens.success) {
    return false;
  }
  const { accessToken } = wcaTokens.data;
  const userInfoRes = await getWCAUserInfo(accessToken);
  if (!userInfoRes.success) {
    return false;
  }
  const userInfo = userInfoRes.data;
  const id = await addUser(userInfo, address);
  const year = getCurrentYear()
  if (userInfo.me.wca_id && year === 2026) {
    await addMembershipIfManuallyPaid(id, userInfo.me.wca_id, year);
  }
  return true;
}

export async function updateWCAInfo(userId: number, sessionId: string, baseUrl: string): Promise<boolean> {
  const wcaTokens = await getValidWcaTokens(sessionId, baseUrl);
  if (!wcaTokens.success) {
    return false;
  }
  const { accessToken } = wcaTokens.data;
  const userInfoRes = await getWCAUserInfo(accessToken);
  if (!userInfoRes.success) {
    return false;
  }
  const userInfo = userInfoRes.data;
  return updateUserInfo(userId, userInfo);
}

export async function updateUserInfo(userId: number, user: WCAProfileResponse): Promise<boolean> {
  const res = await query(`
    UPDATE users
    SET
      name = $1,
      email = $2,
      dob = $3
    WHERE 
      id = $4
    `,
    [
      user.me.name,
      user.me.email,
      user.me.dob,
      userId
    ]
  );
  return res.rowCount !== null && res.rowCount > 0;
}

export async function checkWCASession(sessionId: string, baseUrl: string): Promise<boolean> {
  const wcaTokens = await getWcaTokensFromSessionId(sessionId);
  if (!wcaTokens.success) {
    return false;
  }
  const { refreshToken, accessTokenExpiresAt } = wcaTokens.data;
  if (new Date(Date.now() + 1000 * 60 * 10) < accessTokenExpiresAt) {
    return true;
  }
  const refreshRes = await refreshWCASession(refreshToken, sessionId, baseUrl);
  return refreshRes.success;
}

async function getValidWcaTokens(sessionId: string, baseUrl: string): Promise<Maybe<WCATokens>> {
  const wcaTokens = await getWcaTokensFromSessionId(sessionId);
  if (!wcaTokens.success) {
    return { success: false };
  }
  const { refreshToken, accessTokenExpiresAt } = wcaTokens.data;
  if (new Date(Date.now() + 1000 * 60) > accessTokenExpiresAt) {
    const refreshRes = await refreshWCASession(refreshToken, sessionId, baseUrl)
    if (!refreshRes.success) {
      return { success: false };
    }
    return {
      success: true,
      data: refreshRes.data,
    }
  }
  return {
    success: true,
    data: wcaTokens.data,
  }
}

async function getWcaTokensFromSessionId(sessionId: string): Promise<Maybe<WCATokens>> {
  const res = await query(`
    SELECT 
      wca_access_token AS "accessToken",
      wca_refresh_token AS "refreshToken",
      wca_access_token_expires_at AS "accessTokenExpiresAt"
    FROM sessions
    WHERE id = $1
    `,
    [sessionId]
  )
  if (!res.rowCount) {
    return { success: false };
  }
  const tokens = decryptWCATokens(res.rows[0]);
  return {
    success: true,
    data: tokens,
  }
}

async function refreshWCASession(refreshToken: string, sessionId: string, baseUrl: string): Promise<Maybe<WCATokens>> {
  const wcaTokens = await refreshWCATokens(refreshToken, baseUrl);
  if (!wcaTokens.success) {
    return { success: false };
  }
  const data = wcaTokens.data;
  const encryptedWcaTokens = {
    ...data,
    access_token: encryptToken(data.access_token),
    refresh_token: encryptToken(data.refresh_token),
  };
  const updateRes = await updateWCATokens(encryptedWcaTokens, sessionId);
  if (!updateRes.success) {
    return { success: false };
  }
  return {
    success: true,
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      accessTokenExpiresAt: updateRes.data,
    },
  };
}

export async function getAuth(): Promise<Auth> {
  const refreshToken = await getRefreshToken();
  const decodedRes = await getSessionToken();
  if (!decodedRes.success) {
    return {
      isAuthenticated: false,
      userId: null,
      sessionId: null,
      refreshToken,
    };
  }
  const { data: decoded } = decodedRes;
  const userId = (decoded.payload.userId as number | undefined) ?? null;
  const sessionId = decoded.payload.sub!;
  return {
    isAuthenticated: true,
    userId: userId,
    sessionId: sessionId,
    refreshToken,
  };
}

async function saveSession(
  tokens: WCAOAuthTokenResponse,
  user: WCAProfileResponse,
  refreshTokenHash: string,
  sessionId: string,
  userId: number | null
): Promise<void> {
  await query(`
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
}

async function updateWCATokens(tokens: WCAOAuthTokenResponse, sessionId: string): Promise<Maybe<Date>> {
  const res = await query(`
    UPDATE sessions
    SET
      wca_access_token = $1,
      wca_refresh_token = $2,
      wca_scope = $3,
      wca_access_token_expires_at = $4
    WHERE
      id = $5
    RETURNING
      wca_access_token AS "accessToken",
      wca_refresh_token AS "refreshToken",
      wca_access_token_expires_at AS "accessTokenExpiresAt"
    `,
    [
      tokens.access_token,
      tokens.refresh_token,
      tokens.scope,
      new Date(tokens.created_at * 1000 + tokens.expires_in * 1000),
      sessionId,
    ]
  )
  if (!res.rowCount) {
    return { success: false };
  }
  return {
    success: true,
    data: res.rows[0].wca_access_token_expires_at,
  }
}

export async function updateSession(refreshTokenHash: string, newRefreshTokenHash: string, forceUpdate: boolean): Promise<UpdateSessionRes> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const sessionInfo = await client.query(`
    SELECT id, user_id, last_access, expires_at
    FROM sessions
    WHERE refresh_token_hash = $1
    FOR UPDATE
    `,
      [refreshTokenHash]
    );
    const row = sessionInfo.rows.at(0) as { id: UUID, user_id: number | null, last_access: Date, expires_at: Date } | undefined;
    if (!row) {
      await client.query("ROLLBACK");
      return { success: false, error: "invalid" };
    }
    if (row.expires_at < new Date() || row.last_access < new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7)) {
      return { success: false, error: "expired" };
    }
    if (!forceUpdate && new Date(new Date().getTime() - 1000 * 60) < row.last_access) {
      await client.query("ROLLBACK");
      return { success: false, error: "too_early" };
    }
    const res = await client.query(`
    UPDATE sessions
    SET refresh_token_hash = $1, last_access = NOW()
    WHERE refresh_token_hash = $2
    `,
      [
        newRefreshTokenHash,
        refreshTokenHash,
      ]
    );
    if (!res.rowCount) {
      throw new Error("Could not update session");
    }

    await client.query("COMMIT");
    return { success: true, sessionId: row.id, userId: row.user_id };
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
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

async function getUserIdFromWCAUserId(wcaUserId: number): Promise<number | null> {
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
  return res.rows[0].id as number;
}

async function addUser(user: WCAProfileResponse, address: Address | null): Promise<number> {
  const res = await query(`
    INSERT INTO users (
    name,
    wca_user_id,
    wca_id,
    email,
    dob,
    address,
    post_code,
    post_area,
    created_at
    )
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING id;
    `,
    [
      user.me.name,
      user.me.id,
      user.me.wca_id,
      user.me.email,
      user.me.dob,
      address?.address,
      address?.postCode,
      address?.postArea,
    ]
  );
  const id = res.rows[0].id;
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
  return id;
}

export async function deleteExpiredSessions(): Promise<void> {
  await query(`
    DELETE FROM sessions
    WHERE expires_at < NOW() OR last_access < $1
  `, [new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7)]);
}
