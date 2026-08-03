"use client";

import { Member } from "@/types";
import { useState } from "react";
import Spinner from "@/components/ui/spinner";

function membershipRowCSV(member: Member): string {
  const parts = member.name.split(" ");
  const lastName = parts.pop();
  const firstName = parts.join(" ");
  return [firstName, lastName, member.dob, member.address?.address, member.address?.postCode, member.email, member.createdAt].join(";");
}

function exportMembershipCSV(members: Member[]) {
  const header = "Fornavn;Etternavn;Fødselsdato;Adresse;Postnummer;E-post;Betalingsdato\n"
  const content = header + members.map(membershipRowCSV).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "NKF_medlemsliste.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function MembershipList({
  initialYear,
  initialMembers,
  years,
}: {
  initialYear: number;
  initialMembers: Member[];
  years: number[];
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [loading, setLoading] = useState<boolean>(false);

  async function loadMembers(year: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/members/${year}`);
    if (!res.ok) {
      alert("Noe gikk galt");
      setLoading(false);
      return;
    }
    const { members } = await res.json();
    setMembers(members);
    setSelectedYear(year);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        defaultValue={initialYear}
        onChange={e => loadMembers(parseInt(e.target.value))}
        className="self-center bg-neutral-100 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-start"
      >
        {years.map(year => <option key={year}>{year}</option>)}
      </select>
      <button
        onClick={() => exportMembershipCSV(members.filter(member => member.address !== null && parseInt(member.dob.substring(0, 4)) >= selectedYear - 26))}
        className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit self-center"
      >
        Eksporter medlemsliste
      </button>
      {loading ?
        <Spinner className="self-center mt-8" />
        :
        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>WCA ID</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member =>
              <tr key={member.wcaId}>
                <td>{member.name}</td>
                <td>{member.wcaId ?? "Ingen WCA ID"}</td>
              </tr>
            )}
          </tbody>
        </table>
      }
    </div>
  );
}
