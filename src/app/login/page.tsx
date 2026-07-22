import Title from "@/components/ui/title";
import { getSessionToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/login-button";
import { clientId } from "@/lib/wca-oauth";

async function Login() {
  let decoded;
  try {
    decoded = await getSessionToken();
  } catch {
  }
  if (decoded) {
    redirect("/min-side");
  }
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-16">
      <Title>Innlogging</Title>
      <LoginButton clientId={clientId} />
    </div>
  );
}

export default Login;
