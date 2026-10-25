import { addMemberFromCharge, addMemberFromOrder, getCreatedAgreement, getCreatedCharge, getCreatedOrder, setAgreementCancelled, setAgreementStopped, setChargeCancelled, setChargeCancelledBeforeCreation, setChargeCancelledByAgreementId, setChargeFailed, setOrderCancelled } from "@/lib/vipps/queries";
import { UserLock } from "@/types";
import { PoolClient } from "pg";
import { apiStopAgreement, cancelEpayment, captureEpayment, getAgreement, getCharge, getEpayment } from "@/lib/vipps/api";
import { getMembershipCost } from "@/lib/vipps/util";
import { sendMembershipConfirmation } from "@/lib/mail";
import { hasUserActiveAgreementWithClient } from "@/lib/agreement";

type TransactionResult =
  | { success: false }
  | { success: true; activeAgreement: true }
  | { success: true; activeAgreement: false; activatedMembership: false }
  | { success: true; activeAgreement: false; activatedMembership: true; sendEmail: () => Promise<void> };

type OrderResult =
  | { success: false }
  | { success: true; status: "no_order" | "order_cancelled" }
  | { success: true; status: "order_paid"; sendEmail: () => Promise<void> };

type AgreementResult =
  | { success: false }
  | { success: true; status: "no_agreement" | "agreement_started" | "agreement_cancelled" };

type ChargeResult =
  | { success: false }
  | { success: true, status: "no_charge" | "charge_cancelled" }
  | { success: true; status: "charge_paid"; sendEmail: () => Promise<void> };;

export async function handleOpenTransactionForCreation(user: UserLock, client: PoolClient): Promise<TransactionResult> {
  const { userId } = user;
  const hasActiveAgreement = await hasUserActiveAgreementWithClient(userId, client);
  if (hasActiveAgreement) {
    return { success: true, activeAgreement: true };
  }

  const orderRes = await handleOpenOrderForCreation(user, client);
  if (!orderRes.success) {
    return { success: false };
  }
  switch (orderRes.status) {
    case "order_paid":
      return {
        success: true,
        activeAgreement: false,
        activatedMembership: true,
        sendEmail: orderRes.sendEmail,
      };
    case "order_cancelled":
      return {
        success: true,
        activeAgreement: false,
        activatedMembership: false,
      };
    case "no_order":
      break;
  }

  const agreementRes = await handleOpenAgreementForCreation(user, client);
  if (!agreementRes.success) {
    return { success: false };
  }
  switch (agreementRes.status) {
    case "agreement_started":
      return {
        success: true,
        activeAgreement: true,
      };
    case "agreement_cancelled":
      break;
    case "no_agreement":
      break;
  }

  const chargeRes = await handleOpenChargeForCreation(user, client);
  if (!chargeRes.success) {
    return { success: false };
  }
  switch (chargeRes.status) {
    case "charge_paid":
      return {
        success: true,
        activeAgreement: false,
        activatedMembership: true,
        sendEmail: chargeRes.sendEmail,
      };
    case "charge_cancelled":
      break;
    case "no_charge":
      break;
  }
  return {
    success: true,
    activeAgreement: false,
    activatedMembership: false,
  };
}

async function handleOpenOrderForCreation(user: UserLock, client: PoolClient): Promise<OrderResult> {
  const { userId } = user;
  const order = await getCreatedOrder(userId, client);
  if (!order) {
    return {
      success: true,
      status: "no_order",
    };
  }
  const paymentRes = await getEpayment(order.vippsReference);
  if (!paymentRes.success) {
    return { success: false };
  }
  const payment = paymentRes.data;
  const alreadyCaptured = payment.capturedAmount >= getMembershipCost();
  if (alreadyCaptured || payment.state === "AUTHORIZED") {
    await addMemberFromOrder(userId, order.id, order.year, client);
    if (!alreadyCaptured) {
      const captureRes = await captureEpayment(order.vippsReference);
      if (!captureRes.success) {
        return { success: false };
      }
    }
    return {
      success: true,
      status: "order_paid",
      sendEmail: () => sendMembershipConfirmation(user, order),
    };
  }
  if (payment.state === "CREATED") {
    const cancelRes = await cancelEpayment(order.vippsReference);
    if (!cancelRes.success) {
      return { success: false };
    }
  }
  await setOrderCancelled(order.id, client);
  return {
    success: true,
    status: "order_cancelled",
  };
}

async function handleOpenAgreementForCreation(user: UserLock, client: PoolClient): Promise<AgreementResult> {
  const { userId } = user;
  const agreement = await getCreatedAgreement(userId, client);
  if (!agreement) {
    return {
      success: true,
      status: "no_agreement",
    };
  }
  const agreementRes = await getAgreement(agreement.vippsReference);
  if (!agreementRes.success) {
    return { success: false };
  }
  const agreementData = agreementRes.data;
  const status = agreementData.status;
  switch (status) {
    case "ACTIVE":
      return { success: true, status: "agreement_started" };
    case "EXPIRED":
      await setAgreementCancelled(agreement.vippsReference, client);
      await setChargeCancelledByAgreementId(agreement.id, client);
      return { success: true, status: "agreement_cancelled" };
    case "PENDING":
      await apiStopAgreement(agreement.vippsReference);
      await setAgreementCancelled(agreement.vippsReference, client);
      return { success: true, status: "agreement_cancelled" };
    case "STOPPED":
      await setAgreementStopped(agreement.id, client);
      return { success: true, status: "agreement_cancelled" };
  }
}

async function handleOpenChargeForCreation(user: UserLock, client: PoolClient): Promise<ChargeResult> {
  const { userId } = user;
  const charge = await getCreatedCharge(userId, client);
  if (!charge) {
    return {
      success: true,
      status: "no_charge",
    };
  }
  const chargeRes = await getCharge(charge.agreementRef, charge.chargeRef);
  if (!chargeRes.success) {
    if (chargeRes.status === 404) {
      await setChargeCancelledBeforeCreation(charge.chargeId, client)
      return {
        success: true,
        status: "charge_cancelled",
      };
    }
    return { success: false };
  }
  const chargeData = chargeRes.data;
  const status = chargeData.status;
  if (status === "CHARGED") {
    await addMemberFromCharge(userId, charge.chargeRef, charge.year, client);
    return {
      success: true,
      status: "charge_paid",
      sendEmail: () => sendMembershipConfirmation(user, { id: charge.chargeId, vippsReference: charge.agreementRef, year: charge.year }),
    };
  } else if (status === "CANCELLED") {
    await setChargeCancelled(charge.chargeId, client);
    return {
      success: true,
      status: "charge_cancelled",
    };
  } else if (status === "FAILED") {
    await setChargeFailed(charge.chargeId, client);
    return {
      success: true,
      status: "charge_cancelled",
    };
  }
  return { success: false };
}
