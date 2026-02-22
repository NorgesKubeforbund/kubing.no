import { UrlObject } from "url";

export type Url = string | UrlObject;

export type User = {
  name: string,
  wcaId: string | null,
  email: string,
  dob: string,
};
