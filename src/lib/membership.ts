import { query } from "@/db";
import { getCurrentYear } from "@/lib/time";

export async function isUserMemberInYear(userId: number, year: number): Promise<boolean> {
  const res = await query(`
    SELECT EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = $1 AND year = $2
    )
    `,
    [
      userId,
      year,
    ]
  )
  if (!res.rowCount) {
    throw new Error("Could not check if user is member");
  }
  return res.rows[0].exists as boolean;
}

export async function addMembershipIfManuallyPaid(userId: number, wcaId: string, year: number): Promise<void> {
  const hasManuallyPaid = (await query("SELECT * FROM manual_payments WHERE wca_id = $1", [wcaId])).rowCount;
  if (hasManuallyPaid) {
    await query(`
      INSERT INTO memberships
      (user_id, year)
      VALUES
      ($1, $2);
    `,
      [
        userId,
        year,
      ]
    );
  }
}

export async function isUserMember(userId: number): Promise<boolean> {
  const year = getCurrentYear();
  return isUserMemberInYear(userId, year);
}
