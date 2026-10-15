import { getClient, query } from "@/db";
import { getCurrentMonth, getCurrentYear, toNorwayDateString } from "@/lib/time";
import { getOrderNumber, getUserLock } from "./queries";
import { isUserMemberInYearWithClient } from "@/lib/membership";
import { hasUserActiveAgreementWithClient } from "@/lib/agreement";
import { apiStopAgreement, createCharge, createVippsAgreement, getCharge } from "./api";
import { PoolClient } from "pg";
import { AgreementCreation, UserLock } from "@/types";
import { notifyOfPaymentDue } from "@/lib/mail";


if (!process.env.VIPPS_REF) throw new Error("VIPPS_REF is missing");
const VIPPS_REF = process.env.VIPPS_REF;
const MEMBERSHIP_COST = 10000; // 10000 = 100.00kr


export async function createVippsAgreementAndGetRedirectUrl(userId: number, baseUrl: string): Promise<AgreementCreation> {
  const year = getCurrentYear();
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const hasActiveAgreement = await hasUserActiveAgreementWithClient(userId, client);
    if (hasActiveAgreement) {
      return {
        success: true,
        status: "already_has_agreement",
      };
    }
    const isMember = await isUserMemberInYearWithClient(userId, year, client);
    // TODO: Handle case when user has open order for payment or agreement
    if (isMember) {
      const agreementRes = await createVippsAgreement(baseUrl);
      if (!agreementRes.success) {
        await client.query("ROLLBACK");
        return { success: false };
      }
      const agreement = agreementRes.data;
      await saveCreatedAgreement(userId, agreement.agreementId, client);
      await client.query("COMMIT");
      return {
        success: true,
        status: "created_agreement",
        redirectUrl: agreement.vippsConfirmationUrl,
      };
    }
    const chargeId = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${chargeId}`;
    const agreementRes = await createVippsAgreement(baseUrl, { year, vippsReference });
    if (!agreementRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const agreement = agreementRes.data;
    const agreementId = await saveCreatedAgreement(userId, agreement.agreementId, client);
    await saveCreatedCharge(chargeId, agreementId, year, vippsReference, client);
    await client.query("COMMIT");
    return {
      success: true,
      status: "created_agreement",
      redirectUrl: agreement.vippsConfirmationUrl,
    };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return { success: false };
  } finally {
    client.release();
  }
}

async function saveCreatedAgreement(userId: number, vippsReference: string, client: PoolClient): Promise<number> {
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

async function saveCreatedCharge(orderId: number, agreementId: number, year: number, vippsReference: string, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
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
  return res.rowCount !== null && res.rowCount > 0;
}

export async function stopAgreement(userId: number): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = (await client.query(`
      SELECT
        id,
        vipps_reference AS "vippsReference"
      FROM agreements
      WHERE user_id = $1 AND status = 'ACTIVE'
    `, [userId])).rows.at(0) as undefined | { id: number, vippsReference: string };
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    const stopSuccess = await apiStopAgreement(agreement.vippsReference);
    if (!stopSuccess) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(`
      UPDATE agreements
      SET status = 'STOPPED'
      WHERE id = $1
    `, [agreement.id]);
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

// TODO: When cancelling CREATED charges, also cancel NOT_CREATED charge.
// TODO: Allow charge to go from NOT_CREATED to COMPLETED

export async function createCharges(): Promise<boolean> {
  const chargeDate = getNextChargeDate();
  if (!chargeDate) {
    return true;
  }
  const eligbleUsers = (await query(`
    SELECT
      id AS "userId",
      name,
      email
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
  `, [])).rows as UserLock[];
  for (const user of eligbleUsers) {
    await createChargeDatabase(user.userId, chargeDate);
  }

  const usersWithNotCreatedCharges = (await query(`
    SELECT 
      id AS "userId",
      name,
      email
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
  `, [])).rows as UserLock[];
  for (const user of usersWithNotCreatedCharges) {
    await createChargeVipps(user.userId)
  }
  return true;
}

function getNextChargeDate(): { year: number, due: string } | null {
  const month = getCurrentMonth();
  if (month !== 1 && month !== 12) {
    return null;
  }
  if (month === 1) {
    const tommorow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const due = toNorwayDateString(tommorow);
    const year = getCurrentYear();
    return {
      year,
      due,
    };
  }
  const year = getCurrentYear() + 1;
  const due = `${year}-01-01`;
  return {
    year,
    due,
  };
}

async function createChargeDatabase(userId: number, chargeDate: { year: number, due: string }) {
  const client = await getClient();
  try {
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const agreement = (await client.query(`
      SELECT id AS "agreementId"
      FROM agreements
      WHERE user_id = $1 AND status = 'ACTIVE' AND id NOT IN (
        SELECT agreement_id
        FROM charges
        WHERE status = 'NOT_CREATED' OR status = 'CREATED'
      )
    `, [userId])).rows.at(0) as { agreementId: number } | undefined;
    if (!agreement) {
      await client.query("ROLLBACK");
      return;
    }
    const { agreementId } = agreement;
    const { year, due } = chargeDate;
    // TODO: Create function for creating Vipps reference
    const chargeId = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${chargeId}`;
    await client.query(`
      INSERT INTO charges
      (id, agreement_id, year, status, vipps_reference, type, payment_due)
      VALUES
      ($1, $2, $3, 'NOT_CREATED', $4, 'RECURRING', $5)
    `, [chargeId, agreementId, year, vippsReference, due]);
    await client.query("COMMIT");
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

async function createChargeVipps(userId: number): Promise<void> {
  const client = await getClient();
  try {
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const chargeToBeCreated = (await client.query(`
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
    `, [userId])).rows.at(0) as { agreementRef: string, chargeRef: string, chargeId: number, year: number, due: string } | undefined;
    if (!chargeToBeCreated) {
      await client.query("ROLLBACK");
      return;
    }
    const { agreementRef, chargeRef, year, due, chargeId } = chargeToBeCreated;
    if (toNorwayDateString(new Date()) >= due) {
      const charge = await getCharge(agreementRef, chargeRef);

      if (charge.success) {
        await client.query(`
          UPDATE charges
          SET status = 'CREATED'
          WHERE id = $1
        `, [chargeId]);
        await client.query("COMMIT")
        return;
      }

      if (charge.status === 404) {
        await client.query(`
          UPDATE charges
          SET status = 'CANCELLED_BEFORE_CREATION'
          WHERE id = $1
        `, [chargeId]);
        await client.query("COMMIT")
        return;
      }

      await client.query("ROLLBACK")
      return;
    }
    const createChargeSuccess = await createCharge(agreementRef, chargeRef, due, year);
    if (!createChargeSuccess) {
      await client.query("ROLLBACK");
      return;
    }
    await client.query(`
      UPDATE charges
      SET status = 'CREATED'
      WHERE id = $1
    `, [chargeId]);
    await notifyOfPaymentDue(user, Math.floor(MEMBERSHIP_COST / 100).toString(), due);
    await client.query("COMMIT");
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
