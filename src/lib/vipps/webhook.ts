import { getClient, query } from "@/db";
import { RecurringAgreementActivated, RecurringAgreementExpired, RecurringAgreementRejected, RecurringAgreementStopped, RecurringChargeCaptured, RecurringChargeFailed, WebhookPayload } from "@/types/webhook";
import { notifyOfAgreementEndedAfterFailedCharge, sendMembershipConfirmation } from "@/lib/mail";
import { UserLock } from "@/types";
import { apiStopAgreement } from "./api";
import { PoolClient } from "pg";



export async function handleWebhook(payload: WebhookPayload): Promise<boolean> {
  switch (payload.eventType) {
    case "recurring.agreement-activated.v1":
      return (await handleAgreementActivated(payload));
    case "recurring.agreement-expired.v1":
      return (await handleAgreementCancelled(payload));
    case "recurring.agreement-rejected.v1":
      return (await handleAgreementCancelled(payload));
    case "recurring.agreement-stopped.v1":
      return (await handleAgreementStopped(payload));
    case "recurring.charge-captured.v1":
      return (await handleChargeCaptured(payload));
    case "recurring.charge-failed.v1":
      return (await handleChargeFailed(payload));
    default:
      console.error("Unhandled webhook event type")
      return false;
  }
}

async function handleAgreementActivated(payload: RecurringAgreementActivated): Promise<boolean> {
  await query(`
    UPDATE agreements
    SET status = 'ACTIVE'
    WHERE vipps_reference = $1 AND status = 'CREATED'
  `, [payload.agreementId]);
  return true;
}

async function handleAgreementCancelled(payload: RecurringAgreementExpired | RecurringAgreementRejected): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
      SELECT
        u.id AS "userId",
        u.name,
        u.email
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      WHERE a.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.agreementId])).rows.at(0) as UserLock | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = (await client.query(`
      UPDATE agreements
      SET status = 'CANCELLED'
      WHERE vipps_reference = $1 AND status = 'CREATED'
      RETURNING id
    `, [payload.agreementId])).rows.at(0);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await client.query(`
      UPDATE charges
      SET status = 'CANCELLED'
      WHERE agreement_id = $1 AND status = 'CREATED'
    `, [agreement.id]);
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
  } finally {
    client.release();
  }
}

async function handleAgreementStopped(payload: RecurringAgreementStopped): Promise<boolean> {
  if (payload.actor === "MERCHANT") {
    return true;
  }
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
      SELECT
        u.id AS "userId",
        u.name,
        u.email
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      WHERE a.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.agreementId])).rows.at(0) as UserLock | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = (await client.query(`
      UPDATE agreements
      SET status = 'STOPPED'
      WHERE vipps_reference = $1 AND status = 'ACTIVE'
      RETURNING id
    `, [payload.agreementId])).rows.at(0);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await client.query(`
      UPDATE charges
      SET status = 'CANCELLED'
      WHERE agreement_id = $1 AND status = 'CREATED'
    `, [agreement.id]);
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
  } finally {
    client.release();
  }
}

async function handleChargeCaptured(payload: RecurringChargeCaptured): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const res = (await client.query(`
      SELECT
        u.id AS "userId",
        u.name,
        u.email,
        c.year,
        c.id AS "chargeId"
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      JOIN charges c ON a.id = c.agreement_id
      WHERE c.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.chargeId])).rows.at(0) as (UserLock & { year: number, chargeId: number }) | undefined;
    if (!res) {
      await client.query("ROLLBACK");
      return false;
    }
    const addMemberSuccess = await addMemberFromCharge(res.userId, payload.chargeId, res.year, client);
    if (!addMemberSuccess) {
      await client.query("ROLLBACK");
      return true;
    }
    await client.query("COMMIT");
    try {
      await sendMembershipConfirmation(res, { id: res.chargeId, vippsReference: payload.agreementId, year: res.year });
    } catch (e) {
      console.error(e);
    }
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
  } finally {
    client.release();
  }
}

async function handleChargeFailed(payload: RecurringChargeFailed): Promise<boolean> {
  if (payload.chargeType !== "RECURRING") {
    return true;
  }
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
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
    `, [payload.chargeId])).rows.at(0) as (UserLock & { year: number, chargeId: number, agreementId: number, agreementStatus: string }) | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return true;
    }
    const updateRes = await client.query(`
      UPDATE charges
      SET status = 'FAILED'
      WHERE id = $1 AND status = 'CREATED'
    `, [user.chargeId]);
    if (updateRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return true;
    }
    if (user.agreementStatus === "STOPPED") {
      await client.query("COMMIT");
      return true;
    }
    if (!payload.failureReason || payload.failureReason === "technical_error") {
      await client.query("COMMIT");
      return true;
    }
    const stopAgreementSuccess = await apiStopAgreement(payload.agreementId);
    if (!stopAgreementSuccess) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(`
      UPDATE agreements
      SET status = 'STOPPED'
      WHERE id = $1
    `, [user.agreementId]);
    await client.query("COMMIT");
    try {
      await notifyOfAgreementEndedAfterFailedCharge(user);
    } catch (e) {
      console.error(e);
    }
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
  } finally {
    client.release();
  }
}

async function addMemberFromCharge(userId: number, vippsReference: string, year: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    UPDATE charges
    SET status = 'COMPLETED'
    WHERE vipps_reference = $1 AND status = 'CREATED';
  `, [vippsReference]);
  await client.query(`
    INSERT INTO memberships
    (user_id, year)
    VALUES
    ($1, $2)
    ON CONFLICT (user_id, year) DO NOTHING;
  `, [userId, year]);
  return res.rowCount !== null && res.rowCount > 0;
}
