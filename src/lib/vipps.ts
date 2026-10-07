import { getClient, query } from "@/db";
import { VippsAccessTokenResponse, VippsAgreementCreateReponse, VippsCancelPayment, VippsPaymentCreateReponse, VippsPaymentStatusReponse } from "@/types/responses";
import { getCurrentMonth, getCurrentYear, toNorwayDateString } from "@/lib/time";
import { AgreementCreation, Maybe, Payment, OrderCreated, OrderCreation, User, VippsPaymentStatus, VippsPaymentType } from "@/types";
import { notifyOfAgreementEndedAfterFailedCharge, notifyOfPaymentDue, sendMembershipConfirmation } from "@/lib/mail";
import { PoolClient } from "pg";
import { isUserMemberInYearWithClient } from "@/lib/membership";
import { hasUserActiveAgreementWithClient } from "@/lib/agreement";
import { RecurringAgreementActivated, RecurringAgreementExpired, RecurringAgreementRejected, RecurringAgreementStopped, RecurringChargeCaptured, RecurringChargeFailed, WebhookPayload } from "@/types/webhook";
import { randomUUID } from "crypto";

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
    const hasActiveAgreement = await hasUserActiveAgreementWithClient(userId, client);
    if (hasActiveAgreement) {
      await client.query("ROLLBACK");
      return { success: true, status: "already_has_agreement" };
    }
    // TODO: Handle possibility of created agreement order 
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
        const addMemberSuccess = await addMemberFromOrder(userId, order.id, order.year, client);
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
    const orderId = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${orderId}`;
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
          "paymentDescription": `Medlemskap i NKF ${year}`,
        }),
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      await client.query("ROLLBACK");
      return { success: false };
    }
    const payment = await res.json() as VippsPaymentCreateReponse;
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
    const addMemberSuccess = await addMemberFromOrder(userId, order.id, order.year, client);
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

async function addMemberFromCharge(userId: number, vippsReference: string, year: number, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    UPDATE charges
    SET status = 'COMPLETED'
    WHERE vipps_reference = $1 AND status = 'CREATED';
  `, [vippsReference]);
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
      const addMemberSuccess = await addMemberFromOrder(order.userId, order.id, order.year, client);
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

export async function getAllOrders(): Promise<Payment[]> {
  return (await query(`
    SELECT
      'order' AS "kind",
      o.id,
      o.year,
      o.vipps_reference AS "vippsReference",
      o.status,
      o.created_at AS "createdAt",
      NULL AS "type",
      NULL AS "paymentDue",
      NULL AS "agreementId",
      u.id AS "userId",
      u.name AS "userName",
      u.email
    FROM orders o
    JOIN users u ON u.id = o.user_id

    UNION ALL

    SELECT
      'charge' AS "kind",
      c.id,
      c.year,
      c.vipps_reference AS "vippsReference",
      c.status,
      c.created_at AS "createdAt",
      c.type AS "type",
      c.payment_due AS "paymentDue",
      c.agreement_id AS "agreementId",
      u.id AS "userId",
      u.name AS "userName",
      u.email
    FROM charges c
    JOIN agreements a ON a.id = c.agreement_id
    JOIN users u ON u.id = a.user_id

    ORDER BY "createdAt" DESC
  `, [])).rows;
}

export async function createVippsAgreementAndGetRedirectUrl(userId: number, baseUrl: string): Promise<AgreementCreation> {
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
    const hasActiveAgreement = await hasUserActiveAgreementWithClient(userId, client);
    if (hasActiveAgreement) {
      return {
        success: true,
        status: "already_has_agreement",
      };
    }
    const isMember = await isUserMemberInYearWithClient(userId, year, client);
    // TODO: Handle case when user has open order for payment or agreement
    const accessTokenRes = await getAccessToken();
    if (!accessTokenRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const accessToken = accessTokenRes.data;
    if (isMember) {
      const res = await fetch(
        `${VIPPS_URL}/recurring/v3/agreements`,
        {
          method: "POST",
          signal: AbortSignal.timeout(VIPPS_TIMEOUT),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
            "Merchant-Serial-Number": VIPPS_MSN,
            "Idempotency-Key": randomUUID(),
            ...STANDARD_HEADERS,
          },
          body: JSON.stringify({
            "pricing": {
              "type": "LEGACY",
              "amount": MEMBERSHIP_COST,
              "currency": "NOK",
            },
            "interval": {
              "unit": "YEAR",
              "count": 1,
            },
            "merchantRedirectUrl": `${baseUrl}/min-side`,
            "merchantAgreementUrl": `${baseUrl}/min-side`,
            "productName": `Medlemskap i NKF`,
          }),
        }
      );
      if (!res.ok) {
        console.error(await res.text());
        await client.query("ROLLBACK");
        return { success: false };
      }
      const agreement = await res.json() as VippsAgreementCreateReponse;
      await saveCreatedAgreement(userId, agreement.agreementId, client);
      await client.query("COMMIT");
      return {
        success: true,
        status: "created_agreement",
        redirectUrl: agreement.vippsConfirmationUrl,
      };
    }
    const chargeId = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${chargeId}`;
    const res = await fetch(
      `${VIPPS_URL}/recurring/v3/agreements`,
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
          "pricing": {
            "type": "LEGACY",
            "amount": MEMBERSHIP_COST,
            "currency": "NOK",
          },
          "interval": {
            "unit": "YEAR",
            "count": 1,
          },
          "merchantRedirectUrl": `${baseUrl}/min-side`,
          "merchantAgreementUrl": `${baseUrl}/min-side`,
          "productName": `Medlemskap i NKF`,
          "initialCharge": {
            "amount": MEMBERSHIP_COST,
            "description": `Medlemskap i NKF ${year}`,
            "transactionType": "DIRECT_CAPTURE",
            "orderId": vippsReference,
          }
        }),
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      await client.query("ROLLBACK");
      return { success: false };
    }
    const agreement = await res.json() as VippsAgreementCreateReponse;
    const agreementId = await saveCreatedAgreement(userId, agreement.agreementId, client);
    await saveCreatedCharge(chargeId, agreementId, year, vippsReference, client);
    await client.query("COMMIT");
    return {
      success: true,
      status: "created_agreement",
      redirectUrl: agreement.vippsConfirmationUrl,
    };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return { success: false };
  } finally {
    client.release();
  }
}

async function saveCreatedAgreement(userId: number, vippsReference: string, client: PoolClient): Promise<number> {
  const res = await client.query(`
    INSERT INTO agreements
    (user_id, status, vipps_reference)
    VALUES
    ($1, 'CREATED', $2)
    RETURNING id
    `,
    [
      userId,
      vippsReference,
    ]
  )
  return res.rows[0].id;
}

async function saveCreatedCharge(orderId: number, agreementId: number, year: number, vippsReference: string, client: PoolClient): Promise<boolean> {
  const res = await client.query(`
    INSERT INTO charges
    (id, agreement_id, year, status, vipps_reference, type)
    VALUES
    ($1, $2, $3, 'CREATED', $4, 'INITIAL')
    `,
    [
      orderId,
      agreementId,
      year,
      vippsReference,
    ]
  )
  return res.rowCount !== null && res.rowCount > 0;
}

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
  await query(`
    UPDATE agreements
    SET status = 'ACTIVE'
    WHERE vipps_reference = $1 AND status = 'CREATED'
  `, [payload.agreementId]);
  return true;
}

async function handleAgreementCancelled(payload: RecurringAgreementExpired | RecurringAgreementRejected): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
      SELECT u.*
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      WHERE a.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.agreementId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = (await client.query(`
      UPDATE agreements
      SET status = 'CANCELLED'
      WHERE vipps_reference = $1 AND status = 'CREATED'
      RETURNING id
    `, [payload.agreementId])).rows.at(0);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await client.query(`
      UPDATE charges
      SET status = 'CANCELLED'
      WHERE agreement_id = $1 AND status = 'CREATED'
    `, [agreement.id]);
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
    const user = (await client.query(`
      SELECT u.*
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      WHERE a.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.agreementId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = (await client.query(`
      UPDATE agreements
      SET status = 'STOPPED'
      WHERE vipps_reference = $1 AND status = 'ACTIVE'
      RETURNING id
    `, [payload.agreementId])).rows.at(0);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    await client.query(`
      UPDATE charges
      SET status = 'CANCELLED'
      WHERE agreement_id = $1 AND status = 'CREATED'
    `, [agreement.id]);
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
    const res = (await client.query(`
      SELECT
        u.*,
        u.id AS "userId",
        c.year,
        c.id AS "chargeId"
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      JOIN charges c ON a.id = c.agreement_id
      WHERE c.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.chargeId])).rows.at(0) as (User & { userId: number, year: number, chargeId: number }) | undefined;
    if (!res) {
      await client.query("ROLLBACK");
      return false;
    }
    const addMemberSuccess = await addMemberFromCharge(res.userId, payload.chargeId, res.year, client);
    if (!addMemberSuccess) {
      await client.query("ROLLBACK");
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
    const user = (await client.query(`
      SELECT
        u.*,
        u.id AS "userId",
        c.year,
        c.id AS "chargeId",
        a.id AS "agreementId",
        a.status AS "agreementStatus"
      FROM users u
      JOIN agreements a ON u.id = a.user_id
      JOIN charges c ON a.id = c.agreement_id
      WHERE c.vipps_reference = $1
      FOR UPDATE OF u
    `, [payload.chargeId])).rows.at(0) as (User & { userId: number, year: number, chargeId: number, agreementId: number, agreementStatus: string }) | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return true;
    }
    const updateRes = await client.query(`
      UPDATE charges
      SET status = 'FAILED'
      WHERE id = $1 AND status = 'CREATED'
    `, [user.chargeId]);
    if (updateRes.rowCount === 0) {
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
    const accessTokenRes = await getAccessToken();
    if (!accessTokenRes.success) {
      await client.query("ROLLBACK");
      return false;
    }
    const accessToken = accessTokenRes.data;
    const res = await fetch(
      `${VIPPS_URL}/recurring/v3/agreements/${payload.agreementId}`,
      {
        method: "PATCH",
        signal: AbortSignal.timeout(VIPPS_TIMEOUT),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Merchant-Serial-Number": VIPPS_MSN,
          "Idempotency-Key": randomUUID(),
          ...STANDARD_HEADERS,
        },
        body: JSON.stringify({
          "status": "STOPPED",
        }),
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(`
      UPDATE agreements
      SET status = 'STOPPED'
      WHERE id = $1
    `, [user.agreementId]);
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

export async function stopAgreement(userId: number): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = (await client.query(`
      SELECT *
      FROM users u
      WHERE id = $1
      FOR UPDATE
    `, [userId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = (await client.query(`
      SELECT *
      FROM agreements
      WHERE user_id = $1 AND status = 'ACTIVE'
    `, [userId])).rows.at(0);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    const accessTokenRes = await getAccessToken();
    if (!accessTokenRes.success) {
      await client.query("ROLLBACK");
      return false;
    }
    const accessToken = accessTokenRes.data;
    const res = await fetch(
      `${VIPPS_URL}/recurring/v3/agreements/${agreement.vipps_reference}`,
      {
        method: "PATCH",
        signal: AbortSignal.timeout(VIPPS_TIMEOUT),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Merchant-Serial-Number": VIPPS_MSN,
          "Idempotency-Key": randomUUID(),
          ...STANDARD_HEADERS,
        },
        body: JSON.stringify({
          "status": "STOPPED",
        }),
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(`
      UPDATE agreements
      SET status = 'STOPPED'
      WHERE id = $1
    `, [agreement.id]);
    await client.query(`
      UPDATE charges
      SET status = 'CANCELLED'
      WHERE agreement_id = $1 AND status = 'CREATED'
    `, [agreement.id]);
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

// TODO: When cancelling CREATED charges, also cancel NOT_CREATED charge.
// TODO: Allow charge to go from NOT_CREATED to COMPLETED

export async function createCharges(): Promise<boolean> {
  const chargeDate = getNextChargeDate();
  if (!chargeDate) {
    return true;
  }
  const eligbleUsers = (await query(`
    SELECT *
    FROM users
    WHERE id IN (
      SELECT user_id
      FROM agreements
      WHERE status = 'ACTIVE' AND id NOT IN (
        SELECT agreement_id
        FROM CHARGES
        WHERE status = 'NOT_CREATED' OR STATUS = 'CREATED'
      )
    )
  `, [])).rows as (User & { id: number })[];
  for (const user of eligbleUsers) {
    await createChargeDatabase(user.id, chargeDate);
  }

  const usersWithNotCreatedCharges = (await query(`
    SELECT *
    FROM users
    WHERE id IN (
      SELECT user_id
      FROM agreements
      WHERE status = 'ACTIVE' AND id IN (
        SELECT agreement_id
        FROM CHARGES
        WHERE status = 'NOT_CREATED'
      )
    )
  `, [])).rows as (User & { id: number })[];
  for (const user of usersWithNotCreatedCharges) {
    await createChargeVipps(user.id)
  }
  return true;
}

function getNextChargeDate(): { year: number, due: string } | null {
  const month = getCurrentMonth();
  if (month !== 1 && month !== 12) {
    return null;
  }
  if (month === 1) {
    const tommorow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const due = toNorwayDateString(tommorow);
    const year = getCurrentYear();
    return {
      year,
      due,
    };
  }
  const year = getCurrentYear() + 1;
  const due = `${year}-01-01`;
  return {
    year,
    due,
  };
}

async function createChargeDatabase(userId: number, chargeDate: { year: number, due: string }) {
  const client = await getClient();
  try {
    const user = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
    `, [userId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const agreement = (await client.query(`
      SELECT id AS "agreementId"
      FROM agreements
      WHERE user_id = $1 AND status = 'ACTIVE' AND id NOT IN (
        SELECT agreement_id
        FROM charges
        WHERE status = 'NOT_CREATED' OR status = 'CREATED'
      )
    `, [userId])).rows.at(0) as { agreementId: number } | undefined;
    if (!agreement) {
      await client.query("ROLLBACK");
      return;
    }
    const { agreementId } = agreement;
    const { year, due } = chargeDate;
    // TODO: Create function for creating Vipps reference
    const chargeId = await getOrderNumber(client);
    const vippsReference = `${VIPPS_REF}-${chargeId}`;
    await client.query(`
      INSERT INTO charges
      (id, agreement_id, year, status, vipps_reference, type, payment_due)
      VALUES
      ($1, $2, $3, 'NOT_CREATED', $4, 'RECURRING', $5)
    `, [chargeId, agreementId, year, vippsReference, due]);
    await client.query("COMMIT");
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

async function createChargeVipps(userId: number): Promise<void> {
  const client = await getClient();
  try {
    const user = (await client.query(`
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
    `, [userId])).rows.at(0) as User | undefined;
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const chargeToBeCreated = (await client.query(`
      SELECT
        a.vipps_reference AS "agreementRef",
        c.vipps_reference AS "chargeRef",
        c.id as "chargeId",
        c.year,
        c.payment_due as due
      FROM users u
      JOIN agreements a ON a.user_id = u.id
      JOIN charges c ON c.agreement_id = a.id
      WHERE u.id = $1 AND a.status = 'ACTIVE' AND c.status = 'NOT_CREATED'
    `, [userId])).rows.at(0) as { agreementRef: string, chargeRef: string, chargeId: number, year: number, due: string } | undefined;
    if (!chargeToBeCreated) {
      await client.query("ROLLBACK");
      return;
    }
    const accessTokenRes = await getAccessToken();
    if (!accessTokenRes.success) {
      await client.query("ROLLBACK");
      return;
    }
    const accessToken = accessTokenRes.data;
    const { agreementRef, chargeRef, year, due, chargeId } = chargeToBeCreated;
    if (toNorwayDateString(new Date()) >= due) {
      const res = await fetch(
        `${VIPPS_URL}/recurring/v3/agreements/${agreementRef}/charges/${chargeRef}`,
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
      );

      if (res.ok) {
        await client.query(`
          UPDATE charges
          SET status = 'CREATED'
          WHERE id = $1
        `, [chargeId]);
        await client.query("COMMIT")
        return;
      }

      if (res.status === 404) {
        await client.query(`
          UPDATE charges
          SET status = 'CANCELLED_BEFORE_CREATION'
          WHERE id = $1
        `, [chargeId]);
        await client.query("COMMIT")
        return;
      }
      console.error(await res.text());
      await client.query("ROLLBACK")
      return;
    }
    const res = await fetch(
      `${VIPPS_URL}/recurring/v3/agreements/${agreementRef}/charges`,
      {
        method: "POST",
        signal: AbortSignal.timeout(VIPPS_TIMEOUT),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Merchant-Serial-Number": VIPPS_MSN,
          "Idempotency-Key": chargeRef,
          ...STANDARD_HEADERS,
        },
        body: JSON.stringify({
          "amount": MEMBERSHIP_COST,
          "transactionType": "DIRECT_CAPTURE",
          "description": `Medlemskap i NKF ${year}`,
          "due": due,
          "retryDays": 14,
          "orderId": chargeRef,
        }),
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      await client.query("ROLLBACK");
      return;
    }
    await client.query(`
      UPDATE charges
      SET status = 'CREATED'
      WHERE id = $1
    `, [chargeId]);
    await notifyOfPaymentDue(user, Math.floor(MEMBERSHIP_COST / 100).toString(), due);
    await client.query("COMMIT");
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
