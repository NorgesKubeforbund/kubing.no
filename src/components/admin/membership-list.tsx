"use client";

import { Member } from "@/types";
import { useState, useMemo, useRef } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";

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
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      <Select
        defaultValue={initialYear}
        onChange={e => loadMembers(parseInt(e.target.value))}
        className="self-center"
      >
        {years.map(year => <option key={year}>{year}</option>)}
      </Select>
      <Button
        onClick={() => exportMembershipCSV(members.filter(member => member.address !== null && parseInt(member.dob.substring(0, 4)) >= selectedYear - 26))}
        variant="secondary"
        className="self-center"
      >
        Eksporter medlemsliste
      </Button>
      {loading ?
        <Spinner className="self-center mt-8" />
        :
        <>
          <div>
            Antall medlemmer: {members.length}
          </div>
          <div className="relative w-full max-w-96 self-center">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-11 transition-colors hover:border-neutral-500 focus:border-neutral-900 focus:outline-none"
              type="text"
              placeholder="Medlemssøk"
              autoComplete="off"
              onChange={e => {
                setSearch(e.target.value)
                setPage(1);
              }}
              value={search}
            />
            {search !== "" &&
              <button
                type="button"
                aria-label="Tøm søk"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:bg-neutral-100 focus-visible:text-neutral-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            }
          </div>
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
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                Forrige
              </Button>
              <span className="text-sm">
                Side {page} av {pageCount}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                variant="secondary"
                size="sm"
              >
                Neste
              </Button>
            </div>
          }
        </>
      }
    </div>
  );
}
