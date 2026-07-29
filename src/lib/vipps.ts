import { getClient, query } from "@/db";
import { VippsAccessTokenResponse, VippsPaymentCreateReponse, VippsPaymentStatusReponse } from "@/types/responses";
import { getCurrentYear } from "@/lib/time";
import { OrderCreated, VippsPaymentStatus, VippsPaymentType } from "@/types";
import { sendMembershipConfirmation } from "@/lib/mail";
import { getUser } from "@/lib/user";


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

export async function createVippsPaymentAndGetRedirectUrl(userId: number, paymentType: VippsPaymentType, url: string): Promise<string> {
  const accessToken = await getAccessToken();
  const orderNumber = await getOrderNumber();
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
        "returnUrl": `${url}/api/membership/claim?orderId=${vippsReference}`,
        "userFlow": "WEB_REDIRECT",
        "paymentDescription": `Medlemsskap i NKF ${getCurrentYear()}`,
      }),
    }
  )
  if (!res.ok) {
    console.log(await res.json());
    throw new Error("Could not create Vipps payment.");
  }
  const payment = await res.json() as VippsPaymentCreateReponse;
  await createOrder(userId, getCurrentYear(), vippsReference);
  return payment.redirectUrl;
}

export async function claimMembership(userId: number, vippsReference: string): Promise<void> {
  const userRes = await getUser(userId);
  if (!userRes.success) {
    throw new Error("Could not find user.");
  }
  const user = userRes.data;
  const order = await getOrderByUserIdAndVippsReference(userId, vippsReference);
  const status = await getPaymentStatus(vippsReference);
  if (status !== "AUTHORIZED") {
    throw new Error("Order not payed for yet");
  }
  await capturePayment(vippsReference);
  await addMember(userId, order.id, order.year);
  await sendMembershipConfirmation(user, order);
}

async function getPaymentStatus(reference: string): Promise<VippsPaymentStatus> {
  const accessToken = await getAccessToken();
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
    throw new Error("Could not get Vipps payment status.");
  }
  const status = await res.json() as VippsPaymentStatusReponse;
  return status.state[0];
}

async function getOrderNumber(): Promise<number> {
  const res = await query("select nextval('order_number_idx');", [])
  if (!res.rowCount) {
    throw new Error("Could not get next order number.");
  }
  return res.rows[0].nextval as number;
}

async function createOrder(userId: number, year: number, vippsReference: string): Promise<void> {
  const res = await query(`
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

async function getOrderByUserIdAndVippsReference(userId: number, vippsReference: string): Promise<OrderCreated> {
  const res = await query(`
    SELECT id, year
    FROM orders
    WHERE user_id = $1 AND vipps_reference = $2
    `,
    [
      userId,
      vippsReference,
    ]
  )
  if (!res.rowCount) {
    throw new Error("Could not get order");
  }
  const row = res.rows[0];
  return { year: row.year, id: row.id };
}

async function addMember(userId: number, orderNumber: number, year: number) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const res = await client.query(`
    UPDATE orders
    SET status = 'COMPLETED'
    WHERE id = $1;
    `,
      [
        orderNumber,
      ]
    )
    const res2 = await client.query(`
      INSERT INTO memberships
      (user_id, year)
      VALUES
      ($1, $2);
    `,
      [
        userId,
        year,
      ]
    )
    if (!res.rowCount || !res2.rowCount) {
      throw "Could not add member";
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}
