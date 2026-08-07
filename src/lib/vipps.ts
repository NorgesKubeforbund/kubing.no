import { getClient } from "@/db";
import { VippsAccessTokenResponse, VippsCancelPayment, VippsPaymentCreateReponse, VippsPaymentStatusReponse } from "@/types/responses";
import { getCurrentYear } from "@/lib/time";
import { Maybe, OrderCreated, OrderCreation, User, VippsPaymentStatus, VippsPaymentType } from "@/types";
import { sendMembershipConfirmation } from "@/lib/mail";
import { PoolClient } from "pg";
import { isUserMemberInYearWithClient } from "./membership";

if (!process.env.VIPPS_URL) throw new Error("VIPPS_URL is missing");
if (!process.env.VIPPS_CLIENT_ID) throw new Error("VIPPS_CLIENT_ID is missing");
if (!process.env.VIPPS_CLIENT_SECRET) throw new Error("VIPPS_CLIENT_SECRET is missing");
if (!process.env.VIPPS_SUBSCRIPTION_KEY) throw new Error("VIPPS_SUBSCRIPTION_KEY is missing");
if (!process.env.VIPPS_MSN) throw new Error("VIPPS_MSN is missing");
if (!process.env.VIPPS_REF) throw new Error("VIPPS_REF is missing");

type VippsAccessToken = { accessToken: string, expiresAt: Date }
type VippsPayment = { state: VippsPaymentStatus, capturedAmount: number }
let vippsAccessToken: VippsAccessToken | null = null;
const VIPPS_URL = process.env.VIPPS_URL;
const VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID;
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET;
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY;
const VIPPS_MSN = process.env.VIPPS_MSN;
const VIPPS_REF = process.env.VIPPS_REF;
const MEMBERSHIP_COST = 10000; // 10000 = 100.00kr
const VIPPS_TIMEOUT = 15000;

const STANDARD_HEADERS = {
  "Vipps-System-Name": "kubing-no",
  "Vipps-System-Version": "1.0.0",
  "Vipps-System-Plugin-Name": "kubing-membership",
  "Vipps-System-Plugin-Version": "1.0.0",
};

async function getAccessToken(): Promise<Maybe<string>> {
  if (!vippsAccessToken || vippsAccessToken.expiresAt < new Date()) {
    const res = await fetch(
      `${VIPPS_URL}/accesstoken/get`,
      {
        method: "POST",
        signal: AbortSignal.timeout(VIPPS_TIMEOUT),
        headers: {
          ...STANDARD_HEADERS,
          "Content-Type": "application/json",
          "client_id": VIPPS_CLIENT_ID,
          "client_secret": VIPPS_CLIENT_SECRET,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Merchant-Serial-Number": VIPPS_MSN,
        }
      }
    )
    if (!res.ok) {
      console.error(await res.text());
      return { success: false };
    }
    const accessToken = await res.json() as VippsAccessTokenResponse;
    vippsAccessToken = { accessToken: accessToken.access_token, expiresAt: new Date(accessToken.expires_on * 1000 - 1000 * 30) };
  }
  return {
    success: true,
    data: vippsAccessToken.accessToken,
  };
}

export async function createVippsPaymentAndGetRedirectUrl(userId: number, paymentType: VippsPaymentType, baseUrl: string): Promise<OrderCreation> {
  const year = getCurrentYear();
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
    `, [userId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const isMember = await isUserMemberInYearWithClient(userId, year, client);
    if (isMember) {
      await client.query("ROLLBACK");
      return { success: true, status: "already_member" };
    }
    const createdOrder = await getCreatedOrder(userId, year, client);
    const accessTokenRes = await getAccessToken();
    if (!accessTokenRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const accessToken = accessTokenRes.data;
    if (createdOrder.success) {
      const order = createdOrder.data;
      const paymentRes = await getPayment(order.vippsReference, accessToken);
      if (!paymentRes.success) {
        await client.query("ROLLBACK");
        return { success: false };
      }
      const payment = paymentRes.data;
      const alreadyCaptured = payment.capturedAmount >= MEMBERSHIP_COST;
      if (alreadyCaptured || payment.state === "AUTHORIZED") {
        const addMemberSuccess = await addMember(userId, order.id, order.year, client);
        if (!addMemberSuccess) {
          await client.query("ROLLBACK");
          return { success: false };
        }
        if (!alreadyCaptured) {
          const captureRes = await capturePayment(order.vippsReference, accessToken);
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
        const cancelRes = await cancelOrder(order.vippsReference, accessToken, order.id, client);
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
    const orderNumber = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${orderNumber}`;
    const res = await fetch(
      `${VIPPS_URL}/epayment/v1/payments`,
      {
        method: "POST",
        signal: AbortSignal.timeout(VIPPS_TIMEOUT),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Merchant-Serial-Number": VIPPS_MSN,
          "Idempotency-Key": vippsReference,
          ...STANDARD_HEADERS,
        },
        body: JSON.stringify({
          "amount": { "currency": "NOK", "value": MEMBERSHIP_COST },
          "paymentMethod": { "type": paymentType },
          "reference": vippsReference,
          "returnUrl": `${baseUrl}/min-side`,
          "userFlow": "WEB_REDIRECT",
          "paymentDescription": `Medlemsskap i NKF ${year}`,
        }),
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      await client.query("ROLLBACK");
      return { success: false };
    }
    const payment = await res.json() as VippsPaymentCreateReponse;
    await createOrder(userId, year, vippsReference, client);
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
    const user = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
      `, [userId])).rows.at(0) as User | undefined;
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
    const accessTokenRes = await getAccessToken();
    if (!accessTokenRes.success) {
      await client.query("ROLLBACK");
      return false
    }
    const accessToken = accessTokenRes.data;
    const paymentRes = await getPayment(order.vippsReference, accessToken);
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
    const addMemberSuccess = await addMember(userId, order.id, order.year, client);
    if (!addMemberSuccess) {
      await client.query("ROLLBACK");
      return false;
    }
    if (!alreadyCaptured) {
      const captureRes = await capturePayment(order.vippsReference, accessToken);
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

async function cancelOrder(vippsReference: string, accessToken: string, orderId: number, client: PoolClient): Promise<Maybe<VippsCancelPayment>> {
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${vippsReference}/cancel`,
    {
      method: "POST",
      signal: AbortSignal.timeout(VIPPS_TIMEOUT),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": VIPPS_MSN,
        ...STANDARD_HEADERS,
      },
      body: JSON.stringify({
        "cancelTransactionOnly": false,
      }),
    }
  );
  if (!res.ok) {
    console.error(await res.text());
    return { success: false };
  }
  const status = await res.json() as VippsCancelPayment;
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

async function getPayment(reference: string, accessToken: string): Promise<Maybe<VippsPayment>> {
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${reference}`,
    {
      signal: AbortSignal.timeout(VIPPS_TIMEOUT),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": VIPPS_MSN,
        ...STANDARD_HEADERS,
      },
    }
  )
  if (!res.ok) {
    console.error(await res.text());
    return { success: false };
  }
  const payment = await res.json() as VippsPaymentStatusReponse;
  return {
    success: true,
    data: {
      state: payment.state,
      capturedAmount: payment.aggregate?.capturedAmount?.value ?? 0,
    },
  };
}

async function capturePayment(reference: string, accessToken: string): Promise<Maybe<VippsPaymentStatus>> {
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${reference}/capture`,
    {
      method: "POST",
      signal: AbortSignal.timeout(VIPPS_TIMEOUT),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": VIPPS_MSN,
        "Idempotency-Key": `capture-${reference}`,
        ...STANDARD_HEADERS,
      },
      body: JSON.stringify({
        "modificationAmount": { "currency": "NOK", "value": MEMBERSHIP_COST },
      }),
    }
  )
  if (!res.ok) {
    console.error(await res.text());
    return { success: false };
  }
  const status = await res.json() as VippsPaymentStatusReponse;
  return {
    success: true,
    data: status.state,
  };
}

async function getOrderNumber(client: PoolClient): Promise<number> {
  const res = await client.query("select nextval('order_number_idx');", [])
  return res.rows[0].nextval as number;
}

async function createOrder(userId: number, year: number, vippsReference: string, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    INSERT INTO orders
    (user_id, year, status, vipps_reference)
    VALUES
    ($1, $2, 'CREATED', $3)
    `,
    [
      userId,
      year,
      vippsReference,
    ]
  )
  return res.rowCount !== null && res.rowCount > 0;
}

async function addMember(userId: number, orderNumber: number, year: number, client: PoolClient): Promise<boolean> {
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

  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return false;
  }
  const accessToken = accessTokenRes.data;

  for (const order of openOrders) {
    await handleOpenOrder(order, accessToken);
  }
  return true;
}

async function handleOpenOrder(order: { id: number, userId: number, vippsReference: string, year: number }, accessToken: string): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
    `, [order.userId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const paymentRes = await getPayment(order.vippsReference, accessToken);
    if (!paymentRes.success) {
      await client.query("ROLLBACK");
      return;
    }
    const payment = paymentRes.data;
    const alreadyCaptured = payment.capturedAmount >= MEMBERSHIP_COST;
    if (alreadyCaptured || payment.state === "AUTHORIZED") {
      const addMemberSuccess = await addMember(order.userId, order.id, order.year, client);
      if (!addMemberSuccess) {
        await client.query("ROLLBACK");
        return;
      }
      if (!alreadyCaptured) {
        const captureRes = await capturePayment(order.vippsReference, accessToken);
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
