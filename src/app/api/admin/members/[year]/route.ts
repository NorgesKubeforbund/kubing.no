import { getAuth } from "@/lib/auth";
import { getAllMembers } from "@/lib/membership";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("membership_list")) {
    return NextResponse.json({ error: "Ikke tilstrekkelige rettigheter." }, { status: 403 });
  }
  const { year: inputYear } = await params;
  const year = parseInt(inputYear);
  const members = await getAllMembers(year);
  return NextResponse.json({ members });
}
