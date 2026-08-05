import { Maybe } from "@/types";
import { WCAOAuthTokenResponse, WCAProfileResponse } from "@/types/responses";

if (!process.env.WCA_OAUTH_CLIENT_ID) throw new Error("WCA_OAUTH_CLIENT_ID is missing");
if (!process.env.WCA_OAUTH_SECRET) throw new Error("WCA_OAUTH_SECRET is missing");

export const clientId = process.env.WCA_OAUTH_CLIENT_ID;
const clientSecret = process.env.WCA_OAUTH_SECRET;

export function getWCALoginUrl(url: string, clientId: string): string {
  return `https://www.worldcubeassociation.org/oauth/authorize?client_id=${clientId}&redirect_uri=${getRedirectUri(url)}&response_type=code&scope=public+email+dob`
}

function getRedirectUri(url: string): string {
  return new URL("/oauth/wca", url).toString();
}

export async function getWCATokens(code: string, baseUrl: string): Promise<Maybe<WCAOAuthTokenResponse>> {
  const formData = new FormData();
  formData.append("grant_type", "authorization_code");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("code", code);
  formData.append("redirect_uri", getRedirectUri(baseUrl));
  const res = await fetch(
    "https://www.worldcubeassociation.org/oauth/token",
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    return { success: false };
  }
  const tokenRes = await res.json() as WCAOAuthTokenResponse;
  return {
    success: true,
    data: tokenRes,
  };
}

export async function refreshWCATokens(refreshToken: string, baseUrl: string): Promise<Maybe<WCAOAuthTokenResponse>> {
  const formData = new FormData();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("refresh_token", refreshToken);
  formData.append("redirect_uri", getRedirectUri(baseUrl));
  const res = await fetch(
    "https://www.worldcubeassociation.org/oauth/token",
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    return { success: false };
  }
  const tokenRes = await res.json() as WCAOAuthTokenResponse;
  return {
    success: true,
    data: tokenRes,
  };
}

async function fetchFromWCA(url: string, accessToken: string): Promise<Maybe<unknown>> {
  const res = await fetch(
    url,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });
  if (!res.ok) {
    return { success: false };
  }
  const data = await res.json();
  return {
    success: true,
    data,
  };
}

export async function getWCAUserInfo(accessToken: string): Promise<Maybe<WCAProfileResponse>> {
  return fetchFromWCA("https://www.worldcubeassociation.org/api/v0/me", accessToken) as Promise<Maybe<WCAProfileResponse>>;
}
