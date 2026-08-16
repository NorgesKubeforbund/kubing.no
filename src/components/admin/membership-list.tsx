"use client";

import { Member } from "@/types";
import { useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/spinner";

const PAGE_SIZE = 25;

function membershipRowCSV(member: Member): string {
  const parts = member.name.trim().split(" ");
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

function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
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
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const requestIdRef = useRef(0);

  const filteredMembers = useMemo(() => members.filter(member =>
    stripDiacritics(search).split(" ").every(subSearch =>
      stripDiacritics(member.name).includes(subSearch)
    )
  ), [members, search]);

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  async function loadMembers(year: number) {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    const res = await fetch(`/api/admin/members/${year}`);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (!res.ok) {
      alert("Noe gikk galt");
      setLoading(false);
      return;
    }
    const { members } = await res.json();

    if (requestId !== requestIdRef.current) {
      return;
    }

    setMembers(members);
    setSelectedYear(year);
    setPage(1);
    setLoading(false);
    setSearch("");
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
        <>
          <div>
            Antall medlemmer: {members.length}
          </div>
          <input
            className="w-full max-w-96 border border-neutral-400 rounded-md px-3 py-2 self-center"
            type="text"
            placeholder="Medlemssøk"
            onChange={e => {
              setSearch(e.target.value)
              setPage(1);
            }}
            value={search}
          />
          <div className="overflow-x-auto self-center-safe max-w-full sm:text-xl text-sm">
            <table>
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>NKF ID</th>
                  <th>WCA ID</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member, index) =>
                  <tr
                    key={member.id ?? member.wcaId}
                    className={`hover:bg-table-hover ${index % 2 === 0 ? "bg-table-odd" : "bg-table-even"}`}
                  >
                    <td>{member.name}</td>
                    <td>{member.id ?? "Ingen NKF ID"}</td>
                    <td>{member.wcaId ?? "Ingen WCA ID"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pageCount > 1 &&
            <div className="flex items-center gap-6 self-center mt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1"
              >
                Forrige
              </button>
              <span className="text-sm">
                Side {page} av {pageCount}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1"
              >
                Neste
              </button>
            </div>
          }
        </>
      }
    </div>
  );
}
