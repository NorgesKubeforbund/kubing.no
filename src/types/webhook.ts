import { UUID } from "crypto";

type AgreementBase = {
  agreementId: string;
  agreementUUID: UUID;
  agreementExternalId: string | null;
  occurred: string;
  msn: string;
};

export type RecurringAgreementActivated = AgreementBase & { eventType: "recurring.agreement-activated.v1" };

export type RecurringAgreementRejected = AgreementBase & { eventType: "recurring.agreement-rejected.v1" };

export type RecurringAgreementExpired = AgreementBase & { eventType: "recurring.agreement-expired.v1" };

export type RecurringAgreementStopped = AgreementBase & {
  eventType: "recurring.agreement-stopped.v1";
  actor?: "MERCHANT" | "USER" | "ADMIN" | null;
};

export type RecurringAgreementEvent =
  | RecurringAgreementActivated
  | RecurringAgreementRejected
  | RecurringAgreementExpired
  | RecurringAgreementStopped;

type ChargeBase = {
  agreementId: string;
  chargeId: string;
  chargeExternalId: string | null;
  transactionId: string | null;
  msn: string;
  amount: number;
  chargeType: "INITIAL" | "RECURRING" | "UNSCHEDULED";
  currency: "NOK";
  occurred: string;
  amountCaptured: number;
  amountCanceled: number;
  amountRefunded: number;
};

export type RecurringChargeCaptured = ChargeBase & { eventType: "recurring.charge-captured.v1" };

export type RecurringChargeFailureReason =
  | "user_action_required"
  | "charge_amount_too_high"
  | "technical_error"
  | "non_technical_error";

export type RecurringChargeFailed = ChargeBase & {
  eventType: "recurring.charge-failed.v1";
  failureReason?: RecurringChargeFailureReason | null;
};

export type RecurringChargeEvent = RecurringChargeCaptured | RecurringChargeFailed;

export type WebhookPayload = RecurringAgreementEvent | RecurringChargeEvent;
