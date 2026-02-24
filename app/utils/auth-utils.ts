import * as jose from "jose";
import { cookies } from "next/headers";
import { addUser, getUserIdFromWCAUserId, getWcaTokensFromSessionId, saveSession, updateSession } from "@/app/db";
import crypto from "crypto";
import { WCAOAuthTokenResponse, WCAProfileResponse } from "./response-types";
import { NextResponse } from "next/server";
import { getWCAUserInfo } from "@/app/utils/wca-oauth-utils";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const JWT_ALG = "HS256";
const ENCRYPTION_SECRET = process.env.TOKEN_ENCRYPTION_SECRET ?? "";
const ENCRYPTION_ALG = "aes-256-gcm";
export const SESSION_TOKEN_NAME = "SESSION";
export const REFRESH_TOKEN_NAME = "REFRESH";
export type RefreshToken = { plain: string, hash: string };
export type Tokens = { sessionToken: string, refreshToken: string };

export async function getSessionToken(): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_NAME)?.value;
  if (!token) {
    return Promise.reject("No session token available");
  }
  return jose.jwtVerify(token, JWT_SECRET, {});
}

export async function getRefreshToken(): Promise<string> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_NAME)?.value;
  if (!refreshToken) {
    return Promise.reject("Token not present");
  }
  return refreshToken;
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

export async function updateTokens(refreshToken: string): Promise<Tokens> {
  const newRefreshToken = generateRefreshToken();
  const res = await updateSession(hashToken(refreshToken), newRefreshToken.hash);
  const newSessionToken = await createSessionToken(res.sessionId, res.userId);
  return { sessionToken: newSessionToken, refreshToken: newRefreshToken.plain }
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
  })
  res.cookies.set({
    name: REFRESH_TOKEN_NAME,
    value: tokens.refreshToken,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
  })
}

export async function createUser(sessionId: string, baseUrl: string) {
  const { accessToken, refreshToken } = await getWcaTokensFromSessionId(sessionId);
  const userInfo = await getWCAUserInfo(decryptToken(accessToken), decryptToken(refreshToken), baseUrl);
  await addUser(userInfo);
}
