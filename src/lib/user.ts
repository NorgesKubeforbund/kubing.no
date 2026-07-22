import { getUser, isUserMemberInYear } from "@/db";
import { UserData } from "@/types";
import { getCurrentYear } from "./time";

export async function getUserData(userId: number): Promise<UserData> {
  const user = await getUser(userId);
  const isMember = await isUserMember(userId);
  return {...user, isMember: isMember };
}

export async function isUserMember(userId: number): Promise<boolean> {
  const year = getCurrentYear();
  return isUserMemberInYear(userId, year);
}
