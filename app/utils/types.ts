import { UrlObject } from "url";

export type Url = string | UrlObject;

export type User = {
  name: string,
  wcaId: string | null,
  email: string,
  dob: string,
};

export type UserData =  User & {
  isMember: boolean
};

export type VippsPaymentType = "WALLET" | "CARD";

export type VippsPaymentStatus = "CREATED" | "ABORTED" | "EXPIRED" |  "AUTHORIZED" | "TERMINATED";
