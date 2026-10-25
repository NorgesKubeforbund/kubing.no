import { getClient } from "@/db";
import { getCurrentYear } from "@/lib/time";
import { addMemberFromOrder, getCreatedOrder, getOpenOrders, getOrderNumber, getUserLock, saveCreatedOrder, setOrderCancelled } from "@/lib/vipps/queries";
import { isUserMemberInYearWithClient } from "@/lib/membership";
import { captureEpayment, createEpayment, getEpayment } from "@/lib/vipps/api";
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
    const handleTransactionRes = await handleOpenTransactionForCreation(user, client);
    if (!handleTransactionRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    if (handleTransactionRes.activeAgreement) {
      await client.query("ROLLBACK");
      return { success: true, status: "already_has_agreement" };
    }
    if (handleTransactionRes.activatedMembership) {
      await client.query("COMMIT");
      await handleTransactionRes.sendEmail();
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

export async function claimMembership(userId: number): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const order = await getCreatedOrder(userId, client);
    if (!order) {
      await client.query("ROLLBACK");
      return false;
    }
    const paymentRes = await getEpayment(order.vippsReference);
    if (!paymentRes.success) {
      await client.query("ROLLBACK");
      return false;
    }
    const payment = paymentRes.data;
    const alreadyCaptured = payment.capturedAmount >= getMembershipCost();
    if (!alreadyCaptured && payment.state !== "AUTHORIZED") {
      await client.query("ROLLBACK");
      return false;
    }
    await addMemberFromOrder(userId, order.id, order.year, client);
    if (!alreadyCaptured) {
      const captureRes = await captureEpayment(order.vippsReference);
      if (!captureRes.success) {
        await client.query("ROLLBACK");
        return false;
      }
    }
    await client.query("COMMIT");
    await sendMembershipConfirmation(user, order);
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
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
    const alreadyCaptured = payment.capturedAmount >= getMembershipCost();
    if (alreadyCaptured || payment.state === "AUTHORIZED") {
      await addMemberFromOrder(order.userId, order.id, order.year, client);
      if (!alreadyCaptured) {
        const captureRes = await captureEpayment(order.vippsReference);
        if (!captureRes.success) {
          await client.query("ROLLBACK");
          return;
        }
      }
      await client.query("COMMIT");
      await sendMembershipConfirmation(user, { id: order.id, vippsReference: order.vippsReference, year: order.year });
    } else if (payment.state === "CREATED") {
      await client.query("ROLLBACK");
    } else {
      await setOrderCancelled(order.id, client);
      await client.query("COMMIT");
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
  } finally {
    client.release();
  }
}
