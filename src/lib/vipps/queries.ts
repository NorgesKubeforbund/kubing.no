import { query } from "@/db";
import { Payment, UserLock } from "@/types";
import { PoolClient } from "pg";

export async function getUserLock(userId: number, client: PoolClient): Promise<UserLock | undefined> {
  const user = (await client.query(`
    SELECT
      id AS "userId",
      name,
      email
    FROM users
    WHERE id = $1
    FOR UPDATE
  `, [userId])).rows.at(0) as UserLock | undefined;
  return user;
}

export async function getOrderNumber(client: PoolClient): Promise<number> {
  const res = await client.query("select nextval('order_number_idx')", [])
  return res.rows[0].nextval as number;
}

export async function getAllOrders(): Promise<Payment[]> {
  return (await query(`
    SELECT
      'order' AS "kind",
      o.id,
      o.year,
      o.vipps_reference AS "vippsReference",
      o.status,
      o.created_at AS "createdAt",
      NULL AS "type",
      NULL AS "paymentDue",
      NULL AS "agreementId",
      u.id AS "userId",
      u.name AS "userName",
      u.email
    FROM orders o
    JOIN users u ON u.id = o.user_id

    UNION ALL

    SELECT
      'charge' AS "kind",
      c.id,
      c.year,
      c.vipps_reference AS "vippsReference",
      c.status,
      c.created_at AS "createdAt",
      c.type AS "type",
      c.payment_due AS "paymentDue",
      c.agreement_id AS "agreementId",
      u.id AS "userId",
      u.name AS "userName",
      u.email
    FROM charges c
    JOIN agreements a ON a.id = c.agreement_id
    JOIN users u ON u.id = a.user_id

    ORDER BY "createdAt" DESC
  `, [])).rows;
}
