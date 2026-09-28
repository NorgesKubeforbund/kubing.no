import { query } from "@/db";
import { PoolClient } from "pg";

export async function hasUserActiveAgreement(userId: number): Promise<boolean> {
  const res = await query(`
    SELECT EXISTS (
      SELECT 1 FROM agreements
      WHERE user_id = $1 AND status = 'ACTIVE'
    )
  `, [userId]);
  return res.rows[0].exists as boolean;
}

export async function hasUserActiveAgreementWithClient(userId: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM agreements
      WHERE user_id = $1 AND status = 'ACTIVE'
    )
  `, [userId]);
  return res.rows[0].exists as boolean;
}
