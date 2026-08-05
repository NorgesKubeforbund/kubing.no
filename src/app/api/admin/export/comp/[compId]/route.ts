
import { getAuth } from "@/lib/auth";
import { getManualMembersByWcaIds, getMembersByWcaIds } from "@/lib/membership";
import { CompWCIF } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ compId: string }> }
) {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("members_comp")) {
    return NextResponse.json({ error: "Ikke tilstrekkelige rettigheter." }, { status: 403 });
  }
  const { compId } = await params;
  const res = await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${compId}/wcif/public`);
  if (!res.ok) {
    const body = await res.json() as { error: string };
    return NextResponse.json({ error: body.error })
  }
  const body = await res.json() as CompWCIF;
  const wcaIds = body.persons.map(person => person.wcaId);
  const year = parseInt(body.schedule.startDate.substring(0, 4));
  const nkfMembersInComp = await getMembersByWcaIds(wcaIds, year);
  if (year === 2026) {
    const nonRegisteredNkfMembersInComp = await getManualMembersByWcaIds(wcaIds);;
    nkfMembersInComp.push(...nonRegisteredNkfMembersInComp)
  }
  return NextResponse.json({
    nkfMembersInComp: nkfMembersInComp.sort((p1, p2) => p1.name.localeCompare(p2.name))
  });
}
