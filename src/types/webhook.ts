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

export type RecurringChargeEvent = {
  agreementId: string;
  chargeId: string;
  chargeExternalId: string | null;
  transactionId: string | null;
  msn: string;
  amount: number;
  chargeType: "INITIAL" | "RECURRING" | "UNSCHEDULED";
  eventType: "recurring.charge-captured.v1";
  currency: "NOK";
  occurred: string;
  amountCaptured: number;
  amountCanceled: number;
  amountRefunded: number;
};

export type WebhookPayload = RecurringAgreementEvent | RecurringChargeEvent;
