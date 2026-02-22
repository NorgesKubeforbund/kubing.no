import { getUser } from "@/app/db";
import { User } from "@/app/utils/types";

export async function getUserData(userId: number): Promise<User> {
  return getUser(userId);
}
