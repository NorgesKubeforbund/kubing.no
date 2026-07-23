import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterUser from "@/components/forms/register-user";

export default async function MyPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    redirect("/login");
  }
  if (!userId) {
    return <RegisterUser />
  }
  return children;
}
