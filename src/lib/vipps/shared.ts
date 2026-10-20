import { addMemberFromOrder, getCreatedOrder, setOrderCancelled } from "@/lib/vipps/queries";
import { Maybe, UserLock } from "@/types";
import { PoolClient } from "pg";
import { cancelEpayment, captureEpayment, getEpayment } from "@/lib/vipps/api";
import { getMembershipCost } from "@/lib/vipps/util";
import { sendMembershipConfirmation } from "@/lib/mail";

export async function handleOpenOrderForCreation(user: UserLock, year: number, client: PoolClient): Promise<Maybe<"no_order" | "order_paid" | "order_cancelled">> {
  const { userId } = user;
  const order = await getCreatedOrder(userId, year, client);
  if (!order) {
    return {
      success: true,
      data: "no_order",
    };
  }
  const paymentRes = await getEpayment(order.vippsReference);
  if (!paymentRes.success) {
    await client.query("ROLLBACK");
    return { success: false };
  }
  const payment = paymentRes.data;
  const alreadyCaptured = payment.capturedAmount >= getMembershipCost();
  if (alreadyCaptured || payment.state === "AUTHORIZED") {
    await addMemberFromOrder(userId, order.id, order.year, client);
    if (!alreadyCaptured) {
      const captureRes = await captureEpayment(order.vippsReference);
      if (!captureRes.success) {
        await client.query("ROLLBACK");
        return { success: false };
      }
    }
    await client.query("COMMIT");
    await sendMembershipConfirmation(user, order);
    return {
      success: true,
      data: "order_paid",
    };
  }
  if (payment.state === "CREATED") {
    const cancelRes = await cancelEpayment(order.vippsReference);
    if (!cancelRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
  }
  await setOrderCancelled(order.id, client);
  return {
    success: true,
    data: "order_cancelled",
  };
}
