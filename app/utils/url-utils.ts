import { NextRequest } from "next/server";

export function getBaseUrl(req: NextRequest): string {
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return `${protocol}://${host}`;
}
