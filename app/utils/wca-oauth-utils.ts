import { WCAOAuthTokenResponse, WCAProfileResponse } from "@/app/utils/response-types";

const clientId = process.env.WCA_OAUTH_CLIENT_ID ?? "";
const clientSecret = process.env.WCA_OAUTH_SECRET ?? "";

function getOAuthUrl(url: string) {
  return new URL("/oauth/wca", url).toString();
}

export async function getWCATokens(code: string, url: string): Promise<WCAOAuthTokenResponse> {
  const formData = new FormData();
  formData.append("grant_type", "authorization_code");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("code", code);
  formData.append("redirect_uri", getOAuthUrl(url));
  const res = await fetch(
    "https://www.worldcubeassociation.org/oauth/token",
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    return Promise.reject();
  }
  return await res.json() as WCAOAuthTokenResponse;
}

export async function refreshWCATokens(refreshToken: string, url: string): Promise<WCAOAuthTokenResponse> {
  const formData = new FormData();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("refresh_token", refreshToken);
  formData.append("redirect_uri", getOAuthUrl(url));
  const res = await fetch(
    "https://www.worldcubeassociation.org/oauth/token",
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    return Promise.reject();
  }
  return await res.json() as WCAOAuthTokenResponse;
}

export async function getWCAUserInfo(accessToken: string): Promise<WCAProfileResponse> {
  const res = await fetch(
    "https://www.worldcubeassociation.org/api/v0/me",
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      }
    }
  );
  if (!res.ok) {
    return Promise.reject();
  }
  return await res.json() as WCAProfileResponse;
}
