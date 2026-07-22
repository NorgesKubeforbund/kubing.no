import Title from "@/app/ui/title";
import { getSessionToken } from "@/app/utils/auth-utils";
import { redirect } from "next/navigation";
import LoginButton from "@/app/components/login-button";
import { clientId } from "@/app/utils/wca-oauth-utils";

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
