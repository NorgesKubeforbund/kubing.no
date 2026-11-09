import { getClient } from "@/db";
import {
  EpaymentEvent,
  RecurringAgreementActivated,
  RecurringAgreementExpired,
  RecurringAgreementRejected,
  RecurringAgreementStopped,
  RecurringChargeCaptured,
  RecurringChargeFailed,
  WebhookPayload,
} from "@/types/webhook";
import { notifyOfAgreementEndedAfterFailedCharge, sendMembershipConfirmation } from "@/lib/mail";
import { apiStopAgreement, cancelEpayment, captureEpayment, getEpayment, refundCharge, refundEpayment } from "@/lib/vipps/api";
import {
  addMemberFromCharge,
  addMemberFromOrder,
  getCreatedCharge,
  getUserLockByAgreement,
  getUserLockByCharge,
  getUserLockByEpayment,
  setAgreementActive,
  setAgreementCancelled,
  setAgreementStopped,
  setAgreementStoppedByVippsReference,
  setChargeCancelledByAgreementId,
  setChargeFailed,
  setChargeRefunded,
  setOrderCancelled,
  setOrderRefunded,
} from "@/lib/vipps/queries";
import { handleOpenCharge } from "./agreements";
import { getMembershipCost } from "./util";
import { ChargeWithAgreement, OrderCreated } from "@/types";

export async function handleWebhook(payload: WebhookPayload): Promise<boolean> {
  if (!("eventType" in payload)) {
    return handleEpaymentEvent(payload);
  }

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
      console.error("Unhandled webhook event type");
      return false;
  }
}

async function handleEpaymentEvent(payload: EpaymentEvent): Promise<boolean> {
  if (!payload.success) {
    return true;
  }
  switch (payload.name) {
    case "AUTHORIZED":
      return handlePaymentAuthorized(payload);
    case "ABORTED":
      return handlePaymentNotAccepted(payload);
    case "EXPIRED":
      return handlePaymentNotAccepted(payload);
    default:
      console.error("Unhandled webhook event type");
      return false;
  }
}

async function handleAgreementActivated(payload: RecurringAgreementActivated): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLockByAgreement(payload.agreementId, client);
    if (!user) {
      await client.query("ROLLBACK");
      console.error(`Webhook ${payload.eventType}: no agreement found for ${payload.agreementId}`);
      return true;
    }
    await setAgreementActive(payload.agreementId, client);
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

async function handleAgreementCancelled(payload: RecurringAgreementExpired | RecurringAgreementRejected): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLockByAgreement(payload.agreementId, client);
    if (!user) {
      await client.query("ROLLBACK");
      console.error(`Webhook ${payload.eventType}: no agreement found for ${payload.agreementId}`);
      return true;
    }
    const agreement = await setAgreementCancelled(payload.agreementId, client);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await setChargeCancelledByAgreementId(agreement.id, client);
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
  let openCharge: ChargeWithAgreement | undefined;
  try {
    await client.query("BEGIN");
    const user = await getUserLockByAgreement(payload.agreementId, client);
    if (!user) {
      await client.query("ROLLBACK");
      console.error(`Webhook ${payload.eventType}: no agreement found for ${payload.agreementId}`);
      return true;
    }
    const agreement = await setAgreementStoppedByVippsReference(payload.agreementId, client);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await client.query("COMMIT");
    const charge = await getCreatedCharge(user.userId, client);
    if (charge) {
      openCharge = { ...charge, id: charge.chargeId, userId: user.userId };
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
  } finally {
    client.release();
  }
  if (openCharge) {
    try {
      await handleOpenCharge(openCharge);
    } catch (e) {
      console.error(e);
    }
  }
  return true;
}

async function handleChargeCaptured(payload: RecurringChargeCaptured): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const res = await getUserLockByCharge(payload.chargeId, client);
    if (!res) {
      await client.query("ROLLBACK");
      console.error(`Webhook ${payload.eventType}: no charge found for ${payload.chargeId}`);
      return true;
    }
    const addMemberRes = await addMemberFromCharge(res.userId, payload.chargeId, res.year, client);
    switch (addMemberRes) {
      case "added_membership":
        break;
      case "already_processed":
        await client.query("ROLLBACK");
        return true;
      case "duplicate_payment":
        const refundSuccess = await refundCharge(payload.agreementId, payload.chargeId)
        if (!refundSuccess) {
          await client.query("ROLLBACK");
          return false;
        }
        await setChargeRefunded(res.chargeId, client);
        await client.query("COMMIT");
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

async function handlePaymentAuthorized(payload: EpaymentEvent): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLockByEpayment(payload.reference, client);
    if (!user) {
      await client.query("ROLLBACK");
      return true;
    }
    const order: OrderCreated = {
      id: user.orderId,
      vippsReference: user.vippsReference,
      year: user.year,
    };
    const paymentRes = await getEpayment(order.vippsReference);
    if (!paymentRes.success) {
      await client.query("ROLLBACK");
      return paymentRes.status === 404;
    }
    const payment = paymentRes.data;
    const cost = getMembershipCost();
    if (payment.cancelledAmount >= cost || payment.refundedAmount >= cost) {
      await setOrderRefunded(order.id, client);
      await client.query("COMMIT");
      return true;
    }
    const alreadyCaptured = payment.capturedAmount >= cost;
    if (payment.state !== "AUTHORIZED") {
      await client.query("ROLLBACK");
      return false;
    }
    const addMemberRes = await addMemberFromOrder(user.userId, order.id, order.year, order.vippsReference, client);
    switch (addMemberRes) {
      case "already_processed":
        await client.query("ROLLBACK");
        return true;
      case "added_membership":
        break;
      case "duplicate_payment": {
        const res = alreadyCaptured
          ? await refundEpayment(order.vippsReference)
          : await cancelEpayment(order.vippsReference, false);
        if (!res.success) {
          await client.query("ROLLBACK");
          return false;
        }
        await setOrderRefunded(order.id, client);
        await client.query("COMMIT");
        return true;
      }
    }
    if (!alreadyCaptured) {
      const captureRes = await captureEpayment(order.vippsReference);
      if (!captureRes.success) {
        await client.query("ROLLBACK");
        return false;
      }
    }
    await client.query("COMMIT");
    try {
      await sendMembershipConfirmation(user, order);
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

async function handlePaymentNotAccepted(payload: EpaymentEvent): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLockByEpayment(payload.reference, client);
    if (!user) {
      await client.query("ROLLBACK");
      return true;
    }
    await setOrderCancelled(user.orderId, client);
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
