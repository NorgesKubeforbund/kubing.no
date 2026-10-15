import { getClient } from "@/db";
import {
  RecurringAgreementActivated,
  RecurringAgreementExpired,
  RecurringAgreementRejected,
  RecurringAgreementStopped,
  RecurringChargeCaptured,
  RecurringChargeFailed,
  WebhookPayload,
} from "@/types/webhook";
import { notifyOfAgreementEndedAfterFailedCharge, sendMembershipConfirmation } from "@/lib/mail";
import { apiStopAgreement } from "@/lib/vipps/api";
import {
  addMemberFromCharge,
  getUserLockByAgreement,
  getUserLockByCharge,
  setAgreementActive,
  setAgreementCancelled,
  setAgreementStopped,
  setAgreementStoppedByVippsReference,
  setChargeCancelled,
  setChargeFailed,
} from "@/lib/vipps/queries";

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
  await setAgreementActive(payload.agreementId);
  return true;
}

async function handleAgreementCancelled(payload: RecurringAgreementExpired | RecurringAgreementRejected): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLockByAgreement(payload.agreementId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = await setAgreementCancelled(payload.agreementId, client);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await setChargeCancelled(agreement.id, client);
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
    const user = await getUserLockByAgreement(payload.agreementId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = await setAgreementStoppedByVippsReference(payload.agreementId, client);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await setChargeCancelled(agreement.id, client);
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
    const res = await getUserLockByCharge(payload.chargeId, client);
    if (!res) {
      await client.query("ROLLBACK");
      return false;
    }
    await addMemberFromCharge(res.userId, payload.chargeId, res.year, client);
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
    const user = await getUserLockByCharge(payload.chargeId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return true;
    }
    const updateSuccess = await setChargeFailed(user.chargeId, client);
    if (!updateSuccess) {
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
    await setAgreementStopped(user.agreementId, client);
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
