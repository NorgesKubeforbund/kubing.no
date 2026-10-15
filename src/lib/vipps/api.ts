import { VippsAccessTokenResponse, VippsAgreementCreateReponse, VippsCancelPayment, VippsPayment, VippsPaymentCreateReponse, VippsPaymentStatusReponse } from "@/types/responses";
import { Maybe, MaybeWithStatusCode, VippsPaymentStatus, VippsPaymentType } from "@/types";
import { randomUUID } from "crypto";

if (!process.env.VIPPS_URL) throw new Error("VIPPS_URL is missing");
if (!process.env.VIPPS_CLIENT_ID) throw new Error("VIPPS_CLIENT_ID is missing");
if (!process.env.VIPPS_CLIENT_SECRET) throw new Error("VIPPS_CLIENT_SECRET is missing");
if (!process.env.VIPPS_SUBSCRIPTION_KEY) throw new Error("VIPPS_SUBSCRIPTION_KEY is missing");
if (!process.env.VIPPS_MSN) throw new Error("VIPPS_MSN is missing");
if (!process.env.VIPPS_REF) throw new Error("VIPPS_REF is missing");

type VippsAccessToken = { accessToken: string, expiresAt: Date }
let vippsAccessToken: VippsAccessToken | null = null;
const VIPPS_URL = process.env.VIPPS_URL;
const VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID;
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET;
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY;
const VIPPS_MSN = process.env.VIPPS_MSN;
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

export async function createVippsAgreement(baseUrl: string, charge?: { year: number, vippsReference: string }): Promise<Maybe<VippsAgreementCreateReponse>> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return { success: false };
  }
  const accessToken = accessTokenRes.data;
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
        "Idempotency-Key": charge?.vippsReference ?? randomUUID(),
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
        "initialCharge": charge && {
          "amount": MEMBERSHIP_COST,
          "description": `Medlemskap i NKF ${charge.year}`,
          "transactionType": "DIRECT_CAPTURE",
          "orderId": charge.vippsReference,
        },
      }),
    }
  );
  if (!res.ok) {
    console.error(await res.text());
    return { success: false };
  }
  const agreement = await res.json() as VippsAgreementCreateReponse;
  return {
    success: true,
    data: agreement,
  };
}
export async function apiStopAgreement(vippsReference: string): Promise<boolean> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return false;
  }
  const accessToken = accessTokenRes.data;
  const res = await fetch(
    `${VIPPS_URL}/recurring/v3/agreements/${vippsReference}`,
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
    return false;
  }
  return true;
}

export async function getCharge(agreementRef: string, chargeRef: string): Promise<MaybeWithStatusCode<undefined>> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return { success: false };
  }
  const accessToken = accessTokenRes.data;
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
  if (!res.ok) {
    console.error(await res.text());
    return { success: false, status: res.status };
  }
  // TODO: Give charge a type
  const charge = await res.json();
  return {
    success: true,
    data: charge,
  };
}

export async function createCharge(agreementRef: string, chargeRef: string, due: string, year: number): Promise<boolean> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return false;
  }
  const accessToken = accessTokenRes.data;
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
    return false;
  }
  return true;
}

export async function createEpayment(baseUrl: string, vippsReference: string, paymentType: VippsPaymentType, year: number): Promise<Maybe<VippsPaymentCreateReponse>> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return { success: false };
  }
  const accessToken = accessTokenRes.data;
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
    return { success: false };
  }
  const payment = await res.json() as VippsPaymentCreateReponse;
  if (!res.ok) {
    console.error(await res.text());
    return { success: false };
  }
  return {
    success: true,
    data: payment,
  };
}

export async function getEpayment(reference: string): Promise<Maybe<VippsPayment>> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return { success: false };
  }
  const accessToken = accessTokenRes.data;
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

export async function cancelEpayment(vippsReference: string): Promise<Maybe<VippsCancelPayment>> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return { success: false };
  }
  const accessToken = accessTokenRes.data;
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
  return {
    success: true,
    data: status,
  };
}

export async function captureEpayment(vippsReference: string): Promise<Maybe<VippsPaymentStatus>> {
  const accessTokenRes = await getAccessToken();
  if (!accessTokenRes.success) {
    return { success: false };
  }
  const accessToken = accessTokenRes.data;
  const res = await fetch(
    `${VIPPS_URL}/epayment/v1/payments/${vippsReference}/capture`,
    {
      method: "POST",
      signal: AbortSignal.timeout(VIPPS_TIMEOUT),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": VIPPS_MSN,
        "Idempotency-Key": `capture-${vippsReference}`,
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
