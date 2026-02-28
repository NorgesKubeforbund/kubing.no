import { addMember, createOrder, getOrderByUserIdAndVippsReference, getOrderNumber } from "../db";
import { VippsAccessTokenResponse, VippsPaymentCreateReponse, VippsPaymentStatusReponse } from "./response-types";
import { getCurrentYear } from "./time-utils";
import { VippsPaymentStatus, VippsPaymentType } from "./types";


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
      return Promise.reject("Could not get Vipps access token.");
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
        "paymentDescription": `Medlemsskap i NKF ${new Date().getFullYear()}`,
      }),
    }
  )
  if (!res.ok) {
    return Promise.reject("Could not create Vipps payment.");
  }
  const payment = await res.json() as VippsPaymentCreateReponse;
  await createOrder(userId, getCurrentYear(), vippsReference);
  return payment.redirectUrl;
}

export async function claimMembership(userId: number, vippsReference: string): Promise<void> {
  const order = await getOrderByUserIdAndVippsReference(userId, vippsReference);
  const status = await getPaymentStatus(vippsReference);
  if (status !== "AUTHORIZED") {
    return Promise.reject("Order not payed for yet");
  }
  await capturePayment(vippsReference);
  await addMember(userId, order.id, order.year);
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
    return Promise.reject("Could not get Vipps payment status.");
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
    return Promise.reject("Could not get Vipps payment status.");
  }
  const status = await res.json() as VippsPaymentStatusReponse;
  return status.state[0];
}
