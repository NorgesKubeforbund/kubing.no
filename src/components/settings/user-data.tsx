import { UserData } from "@/types";
import { ReactNode } from "react";

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-neutral-500 italic">{children}</span>;
}

async function UserDataTable({ userData }: { userData: UserData }) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Navn", value: userData.name },
    { label: "WCA ID", value: userData.wcaId ?? <Muted>Ingen WCA ID</Muted> },
    { label: "NKF ID", value: userData.userId },
    { label: "E-post", value: userData.email },
    {
      label: "Fødselsdato",
      value: new Date(userData.dob).toLocaleDateString("nb-NO", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
    {
      label: "Adresse",
      value: userData.address ? (
        <>
          {userData.address.address}
          <br />
          {userData.address.postCode} {userData.address.postArea.toLocaleUpperCase("nb-NO")}
        </>
      ) : (
        <Muted>Ingen adresse registrert</Muted>
      ),
    },
    {
      label: "Medlem i år",
      value: userData.isMember ? "Ja" : "Nei",
    },
    {
      label: "År som medlem",
      value: userData.yearsAsMember.length > 0 ? (
        userData.yearsAsMember.join(", ")
      ) : (
        <Muted>Ingen</Muted>
      ),
    },
  ];

  return (
    <dl className="w-full max-w-xl self-center text-left bg-white border border-neutral-300 rounded-lg divide-y divide-neutral-200 overflow-hidden">
      {rows.map(({ label, value }) => (
        <div key={label} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
          <dt className="text-sm font-medium text-neutral-500">{label}</dt>
          <dd className="mt-1 sm:mt-0 sm:col-span-2 wrap-anywhere">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default UserDataTable;
