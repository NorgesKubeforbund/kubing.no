if (!process.env.APP_URL) throw new Error("APP_URL is missing");
const APP_URL = process.env.APP_URL;

export function getBaseUrl(): string {
  return APP_URL;
}
