import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/login-button";
import BlueLink from "@/components/ui/blue-link";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;
  const hasError = error !== undefined;
  const { isAuthenticated } = await getAuth();
  if (isAuthenticated) {
    redirect("/min-side");
  }
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-16 items-center">
      <Title>Innlogging</Title>
      <div className="flex flex-col gap-8 items-center">
        <LoginButton />
        {hasError &&
          <p className="text-center">
            Noe gikk galt med innloggingen. Hvis problemet vedvarer,
            ta kontakt <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
          </p>
        }
      </div>
    </div>
  );
}
