import { getClient, query } from "@/db";
import { getCurrentYear, toNorwayDateString } from "@/lib/time";
import { Member, UserWithWcaId } from "@/types";
import { PoolClient } from "pg";

export async function isUserMemberInYear(userId: number, year: number): Promise<boolean> {
  const res = await query(`
    SELECT EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = $1 AND year = $2
    )
  `, [userId, year]);
  if (!res.rowCount) {
    throw new Error("Could not check if user is member");
  }
  return res.rows[0].exists as boolean;
}

export async function isUserMemberInYearWithClient(userId: number, year: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = $1 AND year = $2
    )
  `, [userId, year]);
  return res.rows[0].exists as boolean;
}

export async function addMembershipIfManuallyPaid(userId: number, wcaId: string, year: number): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
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
      await query(`
        DELETE FROM manual_payments WHERE wca_id = $1
        `, [wcaId]
      );
    }
    await client.query("COMMIT");
  } catch {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

export async function isUserMember(userId: number): Promise<boolean> {
  const year = getCurrentYear();
  return isUserMemberInYear(userId, year);
}

export async function getAllMembers(year: number): Promise<Member[]> {
  const members = (await query(`
    SELECT 
      u.name,
      u.wca_id AS "wcaId",
      u.email,
      u.dob,
      u.address,
      u.post_code AS "postCode",
      u.post_area AS "postArea",
      m.created_at AS "createdAt"
    FROM users u
    JOIN memberships m ON u.id = m.user_id AND m.year = $1
    ORDER BY u.name
  `, [year])).rows.map(row => ({
    name: row.name,
    wcaId: row.wcaId,
    email: row.email,
    dob: row.dob,
    address: {
      address: row.address,
      postCode: row.postCode,
      postArea: row.postArea,
    },
    createdAt: toNorwayDateString(row.createdAt),
  }));
  if (year !== 2026) {
    return members;
  }
  const manualMembers = (await query(`
    SELECT 
      name,
      wca_id AS "wcaId",
      email,
      dob,
      address,
      post_code AS "postCode",
      post_area AS "postArea",
      created_at AS "createdAt"
    FROM manual_payments
  `, [])).rows.map(row => ({
    name: row.name,
    wcaId: row.wcaId,
    email: row.email,
    dob: row.dob,
    address: {
      address: row.address,
      postCode: row.postCode,
      postArea: row.postArea,
    },
    createdAt: toNorwayDateString(row.createdAt),
  }));
  return [...members, ...manualMembers].sort(sortMembers)
}

export async function getMembersByWcaIds(wcaIds: string[], year: number): Promise<UserWithWcaId[]> {
  const res = await query(`
    SELECT u.name AS name, u.wca_id AS wca_id
    FROM users u
    JOIN memberships m ON m.user_id = u.id AND year = $2
    WHERE u.wca_id = ANY($1)`
    , [wcaIds, year]);
  return res.rows.map(row => (
    {
      name: row.name,
      wcaId: row.wca_id,
    }
  ));
}

export async function getManualMembersByWcaIds(wcaIds: string[]): Promise<UserWithWcaId[]> {
  const res = await query(`
    SELECT name, wca_id
    FROM manual_payments
    WHERE wca_id = ANY($1)`
    , [wcaIds]);
  return res.rows.map(row => (
    {
      name: row.name,
      wcaId: row.wca_id,
    }
  ));
}

export async function getAllYearsWithMembers(): Promise<number[]> {
  const res = await query(`
    SELECT DISTINCT year
    FROM memberships  
  `, []);
  return res.rows.map(row => row.year).sort().reverse();
}

function sortMembers(a: Member, b: Member): number {
  return a.name.localeCompare(b.name, "no", { sensitivity: "base" });
}
