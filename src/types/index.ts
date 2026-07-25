import { UrlObject } from "url";

export type Url = string | UrlObject;

export type User = {
  name: string,
  wcaId: string | null,
  email: string,
  dob: Date,
  address: Address | null,
};

export type UserData = User & {
  isMember: boolean
};

export type VippsPaymentType = "WALLET" | "CARD";

export type VippsPaymentStatus = "CREATED" | "ABORTED" | "EXPIRED" | "AUTHORIZED" | "TERMINATED";

export type Address = {
  address: string,
  postCode: string,
  postArea: string,
};

type AuthNotPresent = {
  isAuthenticated: false;
  userId: null;
  sessionId: null;
};

type AuthPresentNoUser = {
  isAuthenticated: true;
  userId: null;
  sessionId: string;
};

type AuthPresentWithUser = {
  isAuthenticated: true;
  userId: number;
  sessionId: string;
};

export type Auth = AuthNotPresent | AuthPresentNoUser | AuthPresentWithUser;

type UpdateSessionSuccessRes = { success: true, sessionId: string, userId: number | null };

type UpdateSessionError = "invalid" | "too_early" | "expired";

type UpdateSessionFailedRes = { success: false, error: UpdateSessionError }

export type UpdateSessionRes = UpdateSessionSuccessRes | UpdateSessionFailedRes;

export type RefreshToken = { plain: string, hash: string };
export type Tokens = { sessionToken: string, refreshToken: string };
export type TokenCreation = { success: true, tokens: Tokens } | { success: false, error: UpdateSessionError};
