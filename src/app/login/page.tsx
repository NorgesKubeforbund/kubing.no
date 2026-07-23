import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/login-button";
import { clientId } from "@/lib/wca-oauth";

export default async function Login() {
  const { isAuthenticated } = await getAuth();
  if (isAuthenticated) {
    redirect("/min-side");
  }
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-16">
      <Title>Innlogging</Title>
      <LoginButton clientId={clientId} />
    </div>
  );
}
