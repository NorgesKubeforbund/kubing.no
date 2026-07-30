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
  id: number;
  year: number;
  vippsReference: string;
};

export type OrderCreation = { success: true, status: "created_order", redirectUrl: string } | { success: true, status: "order_paid" } | { success: false };

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
  permissions: null;
  sessionId: null;
  refreshToken: string | null;
};

type AuthPresentNoUser = {
  isAuthenticated: true;
  userId: null;
  permissions: null;
  sessionId: string;
  refreshToken: string | null;
};

type AuthPresentWithUser = {
  isAuthenticated: true;
  userId: number;
  permissions: UserPermission[] | null;
  sessionId: string;
  refreshToken: string | null;
};

export type Auth = AuthNotPresent | AuthPresentNoUser | AuthPresentWithUser;

type UpdateSessionSuccessRes = { success: true, sessionId: string, userId: number | null, permissions: UserPermission[] };

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

export type UserPermission = "membership_list" | "members_comp";

export type CompWCIF = {
  persons: {
    wcaId: string;
  }[];
  schedule: { startDate: string };
};

export type UserWithWcaId = {
  name: string;
  wcaId: string;
};
