import { query } from "@/db";
import {
  AddMemberResult,
  Agreement,
  AgreementCreated,
  ChargeCreated,
  OrderCreated,
  Payment,
  UserLock,
  UserLockWithCharge,
} from "@/types";
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

export async function getUserLockByAgreement(vippsReference: string, client: PoolClient): Promise<UserLock | undefined> {
  return (await client.query(`
    SELECT
      u.id AS "userId",
      u.name,
      u.email
    FROM users u
    JOIN agreements a ON u.id = a.user_id
    WHERE a.vipps_reference = $1
    FOR UPDATE OF u
  `, [vippsReference])).rows.at(0) as UserLock | undefined;
}

export async function getUserLockByCharge(vippsReference: string, client: PoolClient): Promise<UserLockWithCharge | undefined> {
  return (await client.query(`
    SELECT
      u.id AS "userId",
      u.name,
      u.email,
      c.year,
      c.id AS "chargeId",
      a.id AS "agreementId",
      a.status AS "agreementStatus"
    FROM users u
    JOIN agreements a ON u.id = a.user_id
    JOIN charges c ON a.id = c.agreement_id
    WHERE c.vipps_reference = $1
    FOR UPDATE OF u
  `, [vippsReference])).rows.at(0) as UserLockWithCharge | undefined;
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

export async function getAllAgreements(): Promise<Agreement[]> {
  return (await query(`
    SELECT
      a.id,
      a.vipps_reference AS "vippsReference",
      a.status,
      a.created_at AS "createdAt",
      u.id AS "userId",
      u.name AS "userName",
      u.email
    FROM agreements a
    JOIN users u ON u.id = a.user_id
    ORDER BY "createdAt" DESC
  `, [])).rows;
}

export async function getOpenOrders(): Promise<{ id: number, userId: number, vippsReference: string, year: number }[]> {
  return (await query(`
    SELECT
      id,
      user_id AS "userId",
      vipps_reference AS "vippsReference",
      year
    FROM orders
    WHERE status = 'CREATED' AND created_at < NOW() - INTERVAL '3 minutes'
  `, [])).rows as { id: number, userId: number, vippsReference: string, year: number }[];
}

export async function getOpenInitialCharges(): Promise<{ id: number, userId: number, chargeRef: string, agreementRef: string, year: number }[]> {
  return (await query(`
    SELECT
      c.id,
      a.user_id AS "userId",
      c.vipps_reference AS "chargeRef",
      a.vipps_reference AS "agreementRef",
      c.year
    FROM charges c
    JOIN agreements a ON a.id = c.agreement_id
    WHERE
      c.status = 'CREATED'
      AND c.created_at < NOW() - INTERVAL '3 minutes'
      AND c.type = 'INITIAL'
  `, [])).rows as { id: number, userId: number, chargeRef: string, agreementRef: string, year: number }[];
}

export async function getOpenAgreements(): Promise<{ id: number, userId: number, vippsReference: string }[]> {
  return (await query(`
    SELECT
      id,
      user_id AS "userId",
      vipps_reference AS "vippsReference"
    FROM agreements
    WHERE status = 'CREATED' AND created_at < NOW() - INTERVAL '3 minutes'
  `, [])).rows as { id: number, userId: number, vippsReference: string }[];
}

export async function saveCreatedAgreement(userId: number, vippsReference: string, client: PoolClient): Promise<number> {
  const res = await client.query(`
    INSERT INTO agreements
    (user_id, status, vipps_reference)
    VALUES
    ($1, 'CREATED', $2)
    RETURNING id
    `,
    [
      userId,
      vippsReference,
    ]
  )
  return res.rows[0].id;
}

export async function saveCreatedCharge(orderId: number, agreementId: number, year: number, vippsReference: string, client: PoolClient): Promise<void> {
  await client.query(`
    INSERT INTO charges
    (id, agreement_id, year, status, vipps_reference, type)
    VALUES
    ($1, $2, $3, 'CREATED', $4, 'INITIAL')
    `,
    [
      orderId,
      agreementId,
      year,
      vippsReference,
    ]
  )
}

export async function saveCreatedOrder(orderId: number, userId: number, year: number, vippsReference: string, client: PoolClient): Promise<void> {
  await client.query(`
    INSERT INTO orders
    (id, user_id, year, status, vipps_reference)
    VALUES
    ($1, $2, $3, 'CREATED', $4)
    `,
    [
      orderId,
      userId,
      year,
      vippsReference,
    ]
  )
}

export async function getActiveAgreementByUserId(userId: number, client: PoolClient): Promise<undefined | { id: number, vippsReference: string }> {
  return (await client.query(`
    SELECT
      id,
      vipps_reference AS "vippsReference"
    FROM agreements
    WHERE user_id = $1 AND status = 'ACTIVE'
  `, [userId])).rows.at(0) as undefined | { id: number, vippsReference: string };
}

export async function getActiveAgreementsNotInList(vippsReferences: string[]): Promise<{ id: number, vippsReference: string, userId: number }[]> {
  return (await query(`
    SELECT
      id,
      vipps_reference AS "vippsReference",
      user_id AS "userId"
    FROM agreements
    WHERE status = 'ACTIVE' AND vipps_reference NOT IN (SELECT unnest($1::text[]))
  `, [vippsReferences])).rows;
}

export async function setAgreementStopped(agreementId: number, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE agreements
    SET status = 'STOPPED'
    WHERE id = $1
  `, [agreementId]);
}

export async function setAgreementStoppedByVippsReference(vippsReference: string, client: PoolClient): Promise<undefined | { id: number }> {
  return (await client.query(`
    UPDATE agreements
    SET status = 'STOPPED'
    WHERE vipps_reference = $1 AND status IN ('ACTIVE', 'CREATED')
    RETURNING id
  `, [vippsReference])).rows.at(0) as undefined | { id: number };
}

export async function setAgreementCancelled(vippsReference: string, client: PoolClient): Promise<undefined | { id: number }> {
  return (await client.query(`
    UPDATE agreements
    SET status = 'CANCELLED'
    WHERE vipps_reference = $1 AND status = 'CREATED'
    RETURNING id
  `, [vippsReference])).rows.at(0) as undefined | { id: number };
}

export async function setChargeCancelled(chargeId: number, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE charges
    SET status = 'CANCELLED'
    WHERE id = $1 AND status IN ('CREATED', 'NOT_CREATED')
  `, [chargeId]);
}

export async function setChargeCancelledByAgreementId(agreementId: number, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE charges
    SET status = 'CANCELLED'
    WHERE agreement_id = $1 AND status IN ('CREATED', 'NOT_CREATED')
  `, [agreementId]);
}

export async function setChargeCreated(chargeId: number, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE charges
    SET status = 'CREATED'
    WHERE id = $1
  `, [chargeId]);
}

export async function setChargeCancelledBeforeCreation(chargeId: number, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE charges
    SET status = 'CANCELLED_BEFORE_CREATION'
    WHERE id = $1
  `, [chargeId]);
}

export async function setChargeFailed(chargeId: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    UPDATE charges
    SET status = 'FAILED'
    WHERE id = $1 AND status IN ('CREATED', 'NOT_CREATED')
  `, [chargeId])
  return res.rowCount !== null && res.rowCount > 0;
}

export async function setChargeRefunded(chargeId: number, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE charges
    SET status = 'REFUNDED'
    WHERE id = $1 AND status IN ('CREATED', 'NOT_CREATED')
  `, [chargeId]);
}

export async function setOrderCancelled(orderId: number, client: PoolClient) {
  await client.query(`
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE id = $1
  `, [orderId]);
}

export async function setOrderRefunded(orderId: number, client: PoolClient) {
  await client.query(`
    UPDATE orders
    SET status = 'REFUNDED'
    WHERE id = $1 AND status = 'CREATED'
  `, [orderId]);
}

export async function getUsersForChargeCreation(): Promise<{ userId: number }[]> {
  return (await query(`
    SELECT
      id AS "userId"
    FROM users
    WHERE id IN (
      SELECT user_id
      FROM agreements
      WHERE status = 'ACTIVE' AND id NOT IN (
        SELECT agreement_id
        FROM CHARGES
        WHERE status = 'NOT_CREATED' OR STATUS = 'CREATED'
      )
    )
  `, [])).rows as { userId: number }[];
}

export async function getUsersWithNotCreatedCharges(): Promise<{ userId: number }[]> {
  return (await query(`
    SELECT 
      id AS "userId"
    FROM users
    WHERE id IN (
      SELECT user_id
      FROM agreements
      WHERE status = 'ACTIVE' AND id IN (
        SELECT agreement_id
        FROM CHARGES
        WHERE status = 'NOT_CREATED'
      )
    )
  `, [])).rows as { userId: number }[];
}

export async function getActiveAgreementWithNoCreatedChargeByUserId(userId: number, client: PoolClient) {
  return (await client.query(`
    SELECT id AS "agreementId"
    FROM agreements
    WHERE user_id = $1 AND status = 'ACTIVE' AND id NOT IN (
      SELECT agreement_id
      FROM charges
      WHERE status = 'NOT_CREATED' OR status = 'CREATED'
    )
  `, [userId])).rows.at(0) as { agreementId: number; } | undefined;
}

export async function addCharge(chargeId: number, agreementId: number, year: number, vippsReference: string, due: string, client: PoolClient): Promise<void> {
  await client.query(`
    INSERT INTO charges
    (id, agreement_id, year, status, vipps_reference, type, payment_due)
    VALUES
    ($1, $2, $3, 'NOT_CREATED', $4, 'RECURRING', $5)
  `, [chargeId, agreementId, year, vippsReference, due]);
}

export async function getChargeToBeCreated(userId: number, client: PoolClient) {
  return (await client.query(`
    SELECT
      a.vipps_reference AS "agreementRef",
      c.vipps_reference AS "chargeRef",
      c.id as "chargeId",
      c.year,
      c.payment_due as due
    FROM users u
    JOIN agreements a ON a.user_id = u.id
    JOIN charges c ON c.agreement_id = a.id
    WHERE u.id = $1 AND a.status = 'ACTIVE' AND c.status = 'NOT_CREATED'
  `, [userId])).rows.at(0) as { agreementRef: string; chargeRef: string; chargeId: number; year: number; due: string; } | undefined;
}

export async function getCreatedOrder(userId: number, client: PoolClient): Promise<undefined | OrderCreated> {
  return (await client.query(`
    SELECT 
      id,
      vipps_reference AS "vippsReference",
      year
    FROM orders
    WHERE user_id = $1 AND status = 'CREATED'
  `, [userId])).rows.at(0) as undefined | OrderCreated;
}

export async function getCreatedAgreement(userId: number, client: PoolClient): Promise<undefined | AgreementCreated> {
  return (await client.query(`
    SELECT 
      id,
      vipps_reference AS "vippsReference"
    FROM agreements
    WHERE user_id = $1 AND status = 'CREATED'
  `, [userId])).rows.at(0) as undefined | AgreementCreated;
}

export async function getCreatedCharge(userId: number, client: PoolClient): Promise<undefined | ChargeCreated> {
  return (await client.query(`
    SELECT
      c.id as "chargeId",
      a.id as "agreementId",
      c.vipps_reference AS "chargeRef",
      a.vipps_reference AS "agreementRef",
      c.year,
      c.payment_due as due
    FROM users u
    JOIN agreements a ON a.user_id = u.id
    JOIN charges c ON c.agreement_id = a.id
    WHERE u.id = $1 AND c.status in ('NOT_CREATED', 'CREATED')
  `, [userId])).rows.at(0) as undefined | ChargeCreated;
}

export async function addMemberFromCharge(userId: number, vippsReference: string, year: number, client: PoolClient): Promise<AddMemberResult> {
  const membershipVippsRef = await getMembershipVippsReference(userId, year, client);
  if (membershipVippsRef === null) {
    await client.query(`
      UPDATE charges
      SET status = 'COMPLETED'
      WHERE vipps_reference = $1 AND status IN ('CREATED', 'NOT_CREATED')
    `, [vippsReference]);
    await addMember(userId, year, vippsReference, client);
    return "added_membership";
  }
  return membershipVippsRef !== vippsReference ? "duplicate_payment" : "already_processed";
}

export async function addMemberFromOrder(userId: number, orderNumber: number, year: number, vippsReference: string, client: PoolClient): Promise<AddMemberResult> {
  const membershipVippsRef = await getMembershipVippsReference(userId, year, client);
  if (membershipVippsRef === null) {
    await client.query(`
      UPDATE orders
      SET status = 'COMPLETED'
      WHERE id = $1 AND status = 'CREATED'
    `, [orderNumber]);
    await addMember(userId, year, vippsReference, client);
    return "added_membership";
  }
  return membershipVippsRef !== vippsReference ? "duplicate_payment" : "already_processed";
}

async function getMembershipVippsReference(userId: number, year: number, client: PoolClient): Promise<string | null> {
  const res = await client.query(`
    SELECT vipps_reference AS "vippsReference"
    FROM memberships
    WHERE user_id = $1 AND year = $2
  `, [userId, year]);
  if (res.rowCount === null || res.rowCount === 0) {
    return null;
  }
  return res.rows.at(0).vippsReference;
}

async function addMember(userId: number, year: number, vippsReference: string, client: PoolClient): Promise<void> {
  await client.query(`
    INSERT INTO memberships
    (user_id, year, vipps_reference)
    VALUES
    ($1, $2, $3)
    ON CONFLICT (user_id, year) DO NOTHING
  `, [userId, year, vippsReference]);
}

export async function setAgreementActive(vippsReference: string, client: PoolClient): Promise<void> {
  await client.query(`
    UPDATE agreements
    SET status = 'ACTIVE'
    WHERE vipps_reference = $1 AND status = 'CREATED'
  `, [vippsReference]);
}
