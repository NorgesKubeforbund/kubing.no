import { getClient } from "@/db";
import { getCurrentYear } from "@/lib/time";
import {
  addMemberFromOrder,
  getOpenOrders,
  getOrderNumber,
  getUserLock,
  saveCreatedOrder,
  setOrderCancelled,
  setOrderRefunded,
} from "@/lib/vipps/queries";
import { isUserMemberInYearWithClient } from "@/lib/membership";
import { cancelEpayment, captureEpayment, createEpayment, getEpayment, refundEpayment } from "@/lib/vipps/api";
import { OrderCreation, VippsPaymentType } from "@/types";
import { sendMembershipConfirmation } from "@/lib/mail";
import { getMembershipCost, getVippsReference } from "@/lib/vipps/util";
import { handleOpenTransactionForCreation } from "@/lib/vipps/shared";

export async function createVippsPaymentAndGetRedirectUrl(userId: number, paymentType: VippsPaymentType, baseUrl: string): Promise<OrderCreation> {
  const year = getCurrentYear();
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const isMember = await isUserMemberInYearWithClient(userId, year, client);
    if (isMember) {
      await client.query("ROLLBACK");
      return { success: true, status: "already_member" };
    }
    const handleTransactionRes = await handleOpenTransactionForCreation(user, true, client);
    if (!handleTransactionRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    if (handleTransactionRes.activeAgreement) {
      await client.query("COMMIT");
      if (handleTransactionRes.sendEmail) {
        try {
          await handleTransactionRes.sendEmail();
        } catch (e) {
          console.error(e);
        }
      }
      return { success: true, status: "already_has_agreement" };
    }
    if (handleTransactionRes.activatedMembership) {
      await client.query("COMMIT");
      try {
        await handleTransactionRes.sendEmail();
      } catch (e) {
        console.error(e);
      }
      return { success: true, status: "already_member" };
    }
    const orderId = await getOrderNumber(client);
    const vippsReference = getVippsReference(orderId);
    const createPaymentRes = await createEpayment(baseUrl, vippsReference, paymentType, year);
    if (!createPaymentRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const payment = createPaymentRes.data;
    await saveCreatedOrder(orderId, userId, year, vippsReference, client);
    await client.query("COMMIT");
    return {
      success: true,
      status: "created_order",
      redirectUrl: payment.redirectUrl,
    };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function handleOpenOrders(): Promise<boolean> {
  const openOrders = await getOpenOrders();
  for (const order of openOrders) {
    await handleOpenOrder(order);
  }
  return true;
}

async function handleOpenOrder(order: { id: number, userId: number, vippsReference: string, year: number }): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(order.userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const paymentRes = await getEpayment(order.vippsReference);
    if (!paymentRes.success) {
      await client.query("ROLLBACK");
      return;
    }
    const payment = paymentRes.data;
    const terminalStates = ["ABORTED", "EXPIRED", "TERMINATED"];
    if (terminalStates.includes(payment.state)) {
      await setOrderCancelled(order.id, client);
      await client.query("COMMIT");
      return;
    }
    const cost = getMembershipCost();
    if (payment.cancelledAmount >= cost || payment.refundedAmount >= cost) {
      await setOrderRefunded(order.id, client);
      await client.query("COMMIT");
      return;
    }
    if (payment.state !== "AUTHORIZED") {
      await client.query("ROLLBACK");
      return;
    }
    const alreadyCaptured = payment.capturedAmount >= cost;
    const addMemberRes = await addMemberFromOrder(user.userId, order.id, order.year, order.vippsReference, client);
    switch (addMemberRes) {
      case "already_processed":
        await client.query("ROLLBACK");
        return;
      case "added_membership":
        break;
      case "duplicate_payment": {
        const res = alreadyCaptured
          ? await refundEpayment(order.vippsReference)
          : await cancelEpayment(order.vippsReference, false);
        if (!res.success) {
          await client.query("ROLLBACK");
          return;
        }
        await setOrderRefunded(order.id, client);
        await client.query("COMMIT");
        return;
      }
    }
    if (!alreadyCaptured) {
      const captureRes = await captureEpayment(order.vippsReference);
      if (!captureRes.success) {
        await client.query("ROLLBACK");
        return;
      }
    }
    await client.query("COMMIT");
    try {
      await sendMembershipConfirmation(user, order);
    } catch (e) {
      console.error(e);
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
  } finally {
    client.release();
  }
}
