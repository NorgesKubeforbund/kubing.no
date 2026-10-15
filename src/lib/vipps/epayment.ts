import { getClient } from "@/db";
import { getCurrentYear } from "@/lib/time";
import { getOrderNumber, getUserLock } from "./queries";
import { isUserMemberInYearWithClient } from "@/lib/membership";
import { hasUserActiveAgreementWithClient } from "@/lib/agreement";
import { cancelEpayment, captureEpayment, createEpayment, getEpayment } from "./api";
import { Maybe, OrderCreated, OrderCreation, VippsPaymentType } from "@/types";
import { sendMembershipConfirmation } from "../mail";
import { VippsCancelPayment } from "@/types/responses";
import { PoolClient } from "pg";

if (!process.env.VIPPS_REF) throw new Error("VIPPS_REF is missing");

const VIPPS_REF = process.env.VIPPS_REF;
const MEMBERSHIP_COST = 10000; // 10000 = 100.00kr

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
    const hasActiveAgreement = await hasUserActiveAgreementWithClient(userId, client);
    if (hasActiveAgreement) {
      await client.query("ROLLBACK");
      return { success: true, status: "already_has_agreement" };
    }
    // TODO: Handle possibility of created agreement order 
    const createdOrder = await getCreatedOrder(userId, year, client);
    if (createdOrder.success) {
      const order = createdOrder.data;
      const paymentRes = await getEpayment(order.vippsReference);
      if (!paymentRes.success) {
        await client.query("ROLLBACK");
        return { success: false };
      }
      const payment = paymentRes.data;
      const alreadyCaptured = payment.capturedAmount >= MEMBERSHIP_COST;
      if (alreadyCaptured || payment.state === "AUTHORIZED") {
        const addMemberSuccess = await addMemberFromOrder(userId, order.id, order.year, client);
        if (!addMemberSuccess) {
          await client.query("ROLLBACK");
          return { success: false };
        }
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
          status: "order_paid",
        };
      } else if (payment.state === "CREATED") {
        const cancelRes = await cancelOrder(order.vippsReference, order.id, client);
        if (!cancelRes.success) {
          await client.query("ROLLBACK");
          return { success: false };
        }
      } else {
        await client.query(`
          UPDATE orders
          SET status = 'CANCELLED'
          WHERE id = $1
        `, [order.id]);
      }
    }
    const orderId = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${orderId}`;
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
  const year = getCurrentYear();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const createdOrder = await getCreatedOrder(userId, year, client);
    if (!createdOrder.success) {
      await client.query("ROLLBACK");
      return false;
    }
    const order = createdOrder.data;
    const paymentRes = await getEpayment(order.vippsReference);
    if (!paymentRes.success) {
      await client.query("ROLLBACK");
      return false;
    }
    const payment = paymentRes.data;
    const alreadyCaptured = payment.capturedAmount >= MEMBERSHIP_COST;
    if (!alreadyCaptured && payment.state !== "AUTHORIZED") {
      await client.query("ROLLBACK");
      return false;
    }
    const addMemberSuccess = await addMemberFromOrder(userId, order.id, order.year, client);
    if (!addMemberSuccess) {
      await client.query("ROLLBACK");
      return false;
    }
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

async function getCreatedOrder(userId: number, year: number, client: PoolClient): Promise<Maybe<OrderCreated>> {
  const createdOrderRes = await client.query(`
    SELECT 
      id,
      vipps_reference AS "vippsReference",
      year
    FROM orders
    WHERE user_id = $1 AND year = $2 AND status = 'CREATED'
    ORDER BY id DESC
    LIMIT 1
  `, [userId, year]);
  if (!createdOrderRes.rowCount) {
    return { success: false };
  }
  return {
    success: true,
    data: createdOrderRes.rows.at(0),
  };
}

async function cancelOrder(vippsReference: string, orderId: number, client: PoolClient): Promise<Maybe<VippsCancelPayment>> {
  const cancelRes = await cancelEpayment(vippsReference);
  if (!cancelRes.success) {
    return { success: false };
  }
  const status = cancelRes.data;
  await client.query(`
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE id = $1
    `, [orderId]);
  return {
    success: true,
    data: status,
  };
}

async function saveCreatedOrder(orderId: number, userId: number, year: number, vippsReference: string, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
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
  return res.rowCount !== null && res.rowCount > 0;
}

async function addMemberFromOrder(userId: number, orderNumber: number, year: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    UPDATE orders
    SET status = 'COMPLETED'
    WHERE id = $1 AND status = 'CREATED';
  `, [orderNumber]);
  await client.query(`
    INSERT INTO memberships
    (user_id, year)
    VALUES
    ($1, $2)
    ON CONFLICT (user_id, year) DO NOTHING;
  `, [userId, year]);
  return res.rowCount !== null && res.rowCount > 0;
}

export async function handleOpenOrders(): Promise<boolean> {
  const client = await getClient();
  let openOrders: { id: number, userId: number, vippsReference: string, year: number }[];
  try {
    openOrders = (await client.query(`
      SELECT
        id,
        user_id AS "userId",
        vipps_reference AS "vippsReference",
        year
      FROM orders
      WHERE status = 'CREATED' AND created_at < NOW() - INTERVAL '3 minutes'
    `)).rows;
  } catch (e) {
    console.error(e);
    return false;
  } finally {
    client.release();
  }

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
    const alreadyCaptured = payment.capturedAmount >= MEMBERSHIP_COST;
    if (alreadyCaptured || payment.state === "AUTHORIZED") {
      const addMemberSuccess = await addMemberFromOrder(order.userId, order.id, order.year, client);
      if (!addMemberSuccess) {
        await client.query("ROLLBACK");
        return;
      }
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
      await client.query(`
        UPDATE orders
        SET status = 'CANCELLED'
        WHERE id = $1
      `, [order.id]);
      await client.query("COMMIT");
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
  } finally {
    client.release();
  }
}
