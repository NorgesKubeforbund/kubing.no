import { WCAOAuthTokenResponse, WCAProfileResponse } from "@/app/utils/response-types";

export const clientId = process.env.WCA_OAUTH_CLIENT_ID ?? "";
const clientSecret = process.env.WCA_OAUTH_SECRET ?? "";

export function getWCALoginUrl(url: string, clientId: string): string {
  return `https://www.worldcubeassociation.org/oauth/authorize?client_id=${clientId}&redirect_uri=${getRedirectUri(url)}&response_type=code&scope=public+email+dob`
}

function getRedirectUri(url: string): string {
  return new URL("/oauth/wca", url).toString();
}

export async function getWCATokens(code: string, baseUrl: string): Promise<WCAOAuthTokenResponse> {
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
    return Promise.reject("Failed to get WCA tokens");
  }
  return await res.json() as WCAOAuthTokenResponse;
}

export async function refreshWCATokens(refreshToken: string, baseUrl: string): Promise<WCAOAuthTokenResponse> {
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
    return Promise.reject("Failed to refresh WCA tokens");
  }
  return await res.json() as WCAOAuthTokenResponse;
}

async function fetchFromWCA(url: string, accessToken: string, refreshToken: string, baseUrl: string) {
  const res = await fetch(
    url,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });
  if (!res.ok) {
    const tokens = await refreshWCATokens(refreshToken, baseUrl);
    const res = await fetch(
      url,
      {
        headers: {
          "Authorization": `Bearer ${tokens.access_token}`,
          "Accept": "application/json",
        },
      });
    if (!res.ok) {
      return Promise.reject(`Failed to fetch from WCA: ${url}`);
    }
    return res.json();
  }
  return res.json();
}

export async function getWCAUserInfo(accessToken: string, refreshToken: string, baseUrl: string): Promise<WCAProfileResponse> {
  return await fetchFromWCA("https://www.worldcubeassociation.org/api/v0/me", accessToken, refreshToken, baseUrl) as WCAProfileResponse;
}
