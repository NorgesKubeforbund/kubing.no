import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { WebhookPayload } from "@/types/webhook";
import { handleWebhook } from "@/lib/vipps";
import { safeEqual } from "@/lib/security";

export async function POST(req: NextRequest) {
  const VIPPS_WEBHOOK_SECRET = process.env.VIPPS_WEBHOOK_SECRET;
  if (!VIPPS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Feilkonfigurering." }, { status: 500 });
  }

  const givenContentHash = req.headers.get("x-ms-content-sha256");
  const givenDate = req.headers.get("x-ms-date");
  const givenHost = req.headers.get("Host");
  const givenAuth = req.headers.get("Authorization");
  if (!givenContentHash || !givenDate || !givenHost || !givenAuth) {
    return NextResponse.json({ error: "Mangler nødvendige parametre." }, { status: 400 });
  }

  const timestamp = Date.parse(givenDate);
  if (Number.isNaN(timestamp) || Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Ugyldig tidsstempel." }, { status: 401 });
  }

  const body = await req.text();

  const expectedContentHash = crypto
    .createHash("sha256")
    .update(body)
    .digest("base64");
  if (givenContentHash !== expectedContentHash) {
    return NextResponse.json({ error: "Ugyldig hash." }, { status: 401 });
  }

  const url = new URL(req.url);
  const pathAndQuery = url.pathname + url.search;
  const expectedSignedString = `POST\n${pathAndQuery}\n${givenDate};${givenHost};${givenContentHash}`;
  const expectedSignature = crypto
    .createHmac("sha256", VIPPS_WEBHOOK_SECRET)
    .update(expectedSignedString)
    .digest("base64")
  const expectedAuth = `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${expectedSignature}`;
  if (!safeEqual(givenAuth, expectedAuth)) {
    return NextResponse.json({ error: "Autorisering feilet." }, { status: 401 });
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }
  const json: WebhookPayload = parsedJson;
  const success = await handleWebhook(json);
  if (!success) {
    return NextResponse.json({ error: "Kunne ikke håndtere webhook" }, { status: 500 });
  }

  return NextResponse.json({});
}
