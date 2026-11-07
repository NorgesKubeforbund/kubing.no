import { getClient } from "@/db";
import { getAuth, updateWCAInfo } from "@/lib/auth";
import { getBaseUrl } from "@/lib/config";
import { getUser } from "@/lib/user";
import { updateNameForAgreement } from "@/lib/vipps/api";
import { getActiveAgreementByUserId } from "@/lib/vipps/queries";
import { NextResponse } from "next/server";

export async function POST() {
  const { isAuthenticated, userId, sessionId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  const preUser = await getUser(userId);
  if (!preUser.success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  const success = await updateWCAInfo(userId, sessionId, getBaseUrl());
  if (!success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  const postUser = await getUser(userId);
  if (!postUser.success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  const client = await getClient();
  const agreement = await getActiveAgreementByUserId(userId, client).finally(() => client.release());
  if (agreement && preUser.data.name !== postUser.data.name) {
    try {
      await updateNameForAgreement(agreement.vippsReference, postUser.data.name);
    } catch (e) {
      console.error(e);
    }
  }
  return NextResponse.json({ message: "Informasjon oppdatert." });
}
