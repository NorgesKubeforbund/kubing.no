import { getSessionToken } from "../utils/auth-utils";
import { redirect } from "next/navigation";
import RegisterUser from "../components/register-user";

export default async function MyPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let decoded;
  try {
    decoded = await getSessionToken();
  } catch {
    redirect("/login");
  }
  if (!decoded.payload.userId) {
    return <RegisterUser />
  }
  return children;
}
