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

export type OrderCreated = {
  year: number;
  id: number;
};

export type Address = {
  address: string,
  postCode: string,
  postArea: string,
};

export type AddressError = "invalid_input" | "api_failure" | "inconclusive";

export type AddressValidation = { success: true, address: Address } | { success: false, error: AddressError };

type AuthNotPresent = {
  isAuthenticated: false;
  userId: null;
  sessionId: null;
  refreshToken: string | null;
};

type AuthPresentNoUser = {
  isAuthenticated: true;
  userId: null;
  sessionId: string;
  refreshToken: string | null;
};

type AuthPresentWithUser = {
  isAuthenticated: true;
  userId: number;
  sessionId: string;
  refreshToken: string | null;
};

export type Auth = AuthNotPresent | AuthPresentNoUser | AuthPresentWithUser;

type UpdateSessionSuccessRes = { success: true, sessionId: string, userId: number | null };

type UpdateSessionError = "invalid" | "too_early" | "expired";

type UpdateSessionFailedRes = { success: false, error: UpdateSessionError }

export type UpdateSessionRes = UpdateSessionSuccessRes | UpdateSessionFailedRes;

export type RefreshToken = { plain: string, hash: string };
export type Tokens = { sessionToken: string, refreshToken: string };

type TokenCreationSuccess = { success: true, tokens: Tokens, sessionId: string };

type TokenCreationError = { success: false, error: UpdateSessionError };

export type TokenCreation = TokenCreationSuccess | TokenCreationError;

export type WCATokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
};

export type Maybe<T> = { success: true, data: T } | { success: false };
