import * as jose from "jose";
import { cookies } from "next/headers";
import { addMembershipIfManuallyPaid, addUser, getUserIdFromWCAUserId, getWcaTokensFromSessionId, saveSession, updateSession, updateUserInfo, updateWCATokens } from "@/db";
import crypto from "crypto";
import { WCAOAuthTokenResponse, WCAProfileResponse } from "@/types/responses";
import { NextResponse } from "next/server";
import { getWCAUserInfo, refreshWCATokens } from "@/lib/wca-oauth";
import { Address, Auth, RefreshToken, TokenCreation, Tokens } from "@/types";
import { getCurrentYear } from "@/lib/time";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const JWT_ALG = "HS256";
const ENCRYPTION_SECRET = process.env.TOKEN_ENCRYPTION_SECRET ?? "";
const ENCRYPTION_ALG = "aes-256-gcm";
export const SESSION_TOKEN_NAME = "SESSION";
export const REFRESH_TOKEN_NAME = "REFRESH";

async function getSessionToken(): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_NAME)?.value;
  if (!token) {
    throw new Error("No session token available");
  }
  return jose.jwtVerify(token, JWT_SECRET);
}

async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_NAME)?.value;
  return refreshToken ?? null;
}

export function createSessionToken(sessionId: string, userId: number | null): Promise<string> {
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
  return (
    {
      sessionToken: sessionToken,
      refreshToken: refreshToken.plain,
    }
  )
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken(): RefreshToken {
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

export async function createUser(sessionId: string, baseUrl: string, address: Address | null) {
  const { accessToken } = await getWcaTokensFromSessionId(sessionId);
  const userInfo = await getWCAUserInfo(decryptToken(accessToken));
  const id = await addUser(userInfo, address);
  const year = getCurrentYear()
  if (userInfo.me.wca_id && year === 2026) {
    await addMembershipIfManuallyPaid(id, userInfo.me.wca_id, year);
  }
}

export async function updateWCAInfo(userId: number, sessionId: string, baseUrl: string) {
  const { refreshToken, accessToken } = await getWcaTokensFromSessionId(sessionId);
  const userInfo = await getWCAUserInfo(decryptToken(accessToken));
  try {
    await updateUserInfo(userId, userInfo);
  } catch {
    await refreshWCASession(refreshToken, sessionId, baseUrl);
    await updateUserInfo(userId, userInfo);
  }
}

export async function checkWCASession(sessionId: string, baseUrl: string): Promise<boolean> {
  try {
    const { refreshToken, accessTokenExpiresAt } = await getWcaTokensFromSessionId(sessionId);
    if (new Date(Date.now() + 1000 * 60 * 10) < accessTokenExpiresAt) {
      return true;
    }
    await refreshWCASession(refreshToken, sessionId, baseUrl);
    return true;
  } catch {
    return false;
  }
}

async function refreshWCASession(refreshToken: string, sessionId: string, baseUrl: string) {
  const wcaTokens = await refreshWCATokens(decryptToken(refreshToken), baseUrl);
  const encryptedWcaTokens = {
    ...wcaTokens,
    access_token: encryptToken(wcaTokens.access_token),
    refresh_token: encryptToken(wcaTokens.refresh_token),
  };
  await updateWCATokens(encryptedWcaTokens, sessionId);
}

export async function getAuth(): Promise<Auth> {
  const refreshToken = await getRefreshToken();
  try {
    const decoded = await getSessionToken();
    const userId = (decoded.payload.userId as number | undefined) ?? null;
    const sessionId = decoded.payload.sub!;
    return {
      isAuthenticated: true,
      userId: userId,
      sessionId: sessionId,
      refreshToken,
    };
  } catch {
    return {
      isAuthenticated: false,
      userId: null,
      sessionId: null,
      refreshToken,
    };
  }
}
