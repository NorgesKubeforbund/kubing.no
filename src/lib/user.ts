import { query } from "@/db";
import { Maybe, User, UserData } from "@/types";
import { isUserMember } from "@/lib/membership";

export async function getUserData(userId: number): Promise<Maybe<UserData>> {
  const userRes = await getUser(userId);
  if (!userRes.success) {
    return { success: false };
  }
  const user = userRes.data;
  const isMember = await isUserMember(userId);
  return {
    success: true,
    data: {
      ...user,
      isMember,
    }
  };
}

export async function getUser(userId: number): Promise<Maybe<User>> {
  const res = await query(`
    SELECT name, wca_id, email, dob, address, post_code, post_area FROM users
    WHERE id = $1
    `,
    [
      userId,
    ]
  )
  if (!res.rowCount) {
    return { success: false };
  }
  const row = res.rows[0];
  return {
    success: true,
    data: {
      name: row.name,
      wcaId: row.wca_id,
      email: row.email,
      dob: row.dob,
      address: row.address ? { address: row.address, postCode: row.post_code, postArea: row.post_area } : null,
    }
  };
}
