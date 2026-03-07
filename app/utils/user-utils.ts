import { getUser, isUserMemberInYear } from "@/app/db";
import { UserData } from "@/app/utils/types";
import { getCurrentYear } from "./time-utils";

export async function getUserData(userId: number): Promise<UserData> {
  const user = await getUser(userId);
  const isMember = await isUserMember(userId);
  return {...user, isMember: isMember };
}

export async function isUserMember(userId: number): Promise<boolean> {
  const year = getCurrentYear();
  return isUserMemberInYear(userId, year);
}
