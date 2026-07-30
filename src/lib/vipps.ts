import { getClient } from "@/db";
import { VippsAccessTokenResponse, VippsCancelPayment, VippsPaymentCreateReponse, VippsPaymentStatusReponse } from "@/types/responses";
import { getCurrentYear } from "@/lib/time";
import { Maybe, OrderCreated, OrderCreation, User, VippsPaymentStatus, VippsPaymentType } from "@/types";
import { sendMembershipConfirmation } from "@/lib/mail";
import { PoolClient } from "pg";


type VippsAccessToken = { accessToken: string, expiresAt: Date }
let vippsAccessToken: VippsAccessToken | null = null;
const VIPPS_URL = process.env.VIPPS_URL ?? "";
const VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID ?? "";
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET ?? "";
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY ?? "";
const VIPPS_MSN = process.env.VIPPS_MSN ?? "";
const VIPPS_REF = process.env.VIPPS_REF ?? "test-kubing";
const MEMBERSHIP_COST = 10000; // 10000 = 100.00kr

const STANDARD_HEADERS = {
  "Vipps-System-Name": "acme",
  "Vipps-System-Version": "3.1.2",
  "Vipps-System-Plugin-Name": "acme-webshop",
  "Vipps-System-Plugin-Version": "4.5.6",
};

async function getAccessToken(): Promise<string> {
  if (!vippsAccessToken || vippsAccessToken.expiresAt < new Date()) {
    const res = await fetch(
      `${VIPPS_URL}/accesstoken/get`,
      {
        method: "POST",
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
      console.log(await res.json());
      throw new Error("Could not get Vipps access token.");
    }
    const accessToken = await res.json() as VippsAccessTokenResponse;
    vippsAccessToken = { accessToken: accessToken.access_token, expiresAt: new Date(accessToken.expires_on * 1000 - 1000 * 30) };
  }
  return vippsAccessToken.accessToken;
}

export async function createVippsPaymentAndGetRedirectUrl(userId: number, paymentType: VippsPaymentType, baseUrl: string): Promise<OrderCreation> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user: User = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
      `, [userId])).rows.at(0);
    const createdOrder = await getCreatedOrder(userId, client);
    const accessToken = await getAccessToken();
    if (createdOrder.success) {
      const order = createdOrder.data;
      const status = await getPaymentStatus(order.vippsReference, accessToken);
      if (status === "AUTHORIZED") {
        await capturePayment(order.vippsReference);
        await addMember(userId, order.id, order.year, client);
        await sendMembershipConfirmation(user, order);
        await client.query("COMMIT");
        return {
          success: true,
          status: "order_paid",
        };
      } else {
        await cancelOrder(order.vippsReference, accessToken, order.id, client);
      }
    }
    const orderNumber = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${orderNumber}`;
    const res = await fetch(
      `${VIPPS_URL}/epayment/v1/payments`,
      {
        method: "POST",
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
          "paymentDescription": `Medlemsskap i NKF ${getCurrentYear()}`,
        }),
      }
    );
    if (!res.ok) {
      console.log(await res.json());
      throw new Error("Could not create Vipps payment.");
    }
    const payment = await res.json() as VippsPaymentCreateReponse;
    await createOrder(userId, getCurrentYear(), vippsReference, client);
    await client.query("COMMIT");
    return {
      success: true,
      status: "created_order",
      redirectUrl: payment.redirectUrl,
    };
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}

export async function claimMembership(userId: number): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user: User = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
      `, [userId])).rows.at(0);
    const createdOrder = await getCreatedOrder(userId, client);
    if (!createdOrder.success) {
      await client.query("ROLLBACK")
      return false;
    }
    const order = createdOrder.data;
    const accessToken = await getAccessToken();
    const status = await getPaymentStatus(order.vippsReference, accessToken);
    if (status !== "AUTHORIZED") {
      await client.query("ROLLBACK")
      return false;
    }
    await capturePayment(order.vippsReference);
    await addMember(userId, order.id, order.year, client);
    await sendMembershipConfirmation(user, order);
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}

async function getCreatedOrder(userId: number, client: PoolClient): Promise<Maybe<OrderCreated>> {
  const createdOrderRes = await client.query(`
    SELECT 
      id,
      vipps_reference AS "vippsReference",
      year
    FROM orders
    WHERE user_id = $1 AND status = 'CREATED'
  `, [userId]);
  if (!createdOrderRes.rowCount) {
    return { success: false };
  }
  return {
    success: true,
    data: createdOrderRes.rows.at(0),
  };
}

async function cancelOrder(vippsReference: string, accessToken: string, orderId: number, client: PoolClient): Promise<VippsCancelPayment> {
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${vippsReference}/cancel`,
    {
      method: "POST",
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
    console.log(await res.json());
    throw new Error("Could not cancel Vipps payment.");
  }
  const status = await res.json() as VippsCancelPayment;
  await client.query(`
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE id = $1
  `, [orderId]);
  return status;
}

async function getPaymentStatus(reference: string, accessToken: string): Promise<VippsPaymentStatus> {
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${reference}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": VIPPS_MSN,
      },
    }
  )
  if (!res.ok) {
    throw new Error("Could not get Vipps payment status.");
  }
  const status = await res.json() as VippsPaymentStatusReponse;
  return status.state;
}

async function capturePayment(reference: string) {
  const accessToken = await getAccessToken();
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${reference}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": VIPPS_MSN,
        "Idempotency-Key": reference,
        ...STANDARD_HEADERS,
      },
      body: JSON.stringify({
        "modificationAmount": { "currency": "NOK", "value": MEMBERSHIP_COST },
      }),
    }
  )
  if (!res.ok) {
    throw new Error("Could not capture Vipps payment status.");
  }
  const status = await res.json() as VippsPaymentStatusReponse;
  return status.state[0];
}

async function getOrderNumber(client: PoolClient): Promise<number> {
  const res = await client.query("select nextval('order_number_idx');", [])
  if (!res.rowCount) {
    throw new Error("Could not get next order number.");
  }
  return res.rows[0].nextval as number;
}

async function createOrder(userId: number, year: number, vippsReference: string, client: PoolClient): Promise<void> {
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
  if (!res.rowCount) {
    throw new Error("Could not create order");
  }
}

async function addMember(userId: number, orderNumber: number, year: number, client: PoolClient) {
  const res = await client.query(`
    UPDATE orders
    SET status = 'COMPLETED'
    WHERE id = $1;
  `, [orderNumber]);
  const res2 = await client.query(`
    INSERT INTO memberships
    (user_id, year)
    VALUES
    ($1, $2);
  `, [userId, year]);
  if (!res.rowCount || !res2.rowCount) {
    throw "Could not add member";
  }
}
