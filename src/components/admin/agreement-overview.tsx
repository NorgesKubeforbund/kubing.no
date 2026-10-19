"use client";
import { cn } from "@/lib/utils";
import { Agreement } from "@/types";
import { ChevronDownIcon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const PAGE_SIZE = 25;

type AgreementStatus = "CREATED" | "CANCELLED" | "ACTIVE" | "STOPPED";

export default function AgreementOverview({ agreements }: { agreements: Agreement[] }) {
  const [page, setPage] = useState<number>(1);
  const [agreementFilter, setAgreementFilter] = useState<AgreementStatus | "ALL">("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => agreementFilter === "ALL" || agreement.status === agreementFilter);
  }, [agreements, agreementFilter]);

  const paginatedAgreements = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAgreements.slice(start, start + PAGE_SIZE);
  }, [filteredAgreements, page]);

  const pageCount = Math.max(1, Math.ceil(filteredAgreements.length / PAGE_SIZE));

  function toggleExpanded(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        onChange={e => {
          setAgreementFilter(e.target.value as AgreementStatus | "ALL");
          setPage(1);
        }}
        className="self-center bg-neutral-100 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-start"
      >
        <option value="ALL">
          Vis alle
        </option>
        <option value="ACTIVE">
          Aktiv
        </option>
        <option value="CREATED">
          Laget
        </option>
        <option value="CANCELLED">
          Kansellert
        </option>
        <option value="STOPPED">
          Avsluttet
        </option>
      </select>
      <div className="overflow-x-auto self-center-safe max-w-full sm:text-xl text-sm">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Avtalenr.</th>
              <th>Navn</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAgreements.map((agreement, index) => {
              const isExpanded = expandedIds.has(agreement.id);
              return (
                <Fragment key={agreement.id}>
                  <tr
                    onClick={() => toggleExpanded(agreement.id)}
                    className={`cursor-pointer hover:bg-neutral-400 ${index % 2 === 0 ? "bg-neutral-300" : "bg-neutral-200"}`}
                  >
                    <td><ChevronDownIcon className={cn(`transition-transform duration-200`, isExpanded && "-rotate-180")} /> </td>
                    <td>{agreement.id}</td>
                    <td>{agreement.userName}</td>
                    <td>{translateStatus(agreement.status)}</td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-neutral-100">
                      <td colSpan={4} className="p-0">
                        <table className="w-full text-left text-sm">
                          <tbody>
                            <tr>
                              <td>NKF ID</td>
                              <td>{agreement.userId}</td>
                            </tr>
                            <tr className="border-t border-neutral-300">
                              <td>E-post</td>
                              <td>{agreement.email}</td>
                            </tr>
                            <tr className="border-t border-neutral-300">
                              <td>Vipps-referanse</td>
                              <td>{agreement.vippsReference}</td>
                            </tr>
                            <tr className="border-t border-neutral-300">
                              <td>Opprettet</td>
                              <td>{new Date(agreement.createdAt).toLocaleString("nb-NO", { dateStyle: "full", timeStyle: "medium" })}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
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
    </div>
  );
}

function translateStatus(status: string) {
  switch (status) {
    case "CREATED":
      return "Laget";
    case "ACTIVE":
      return "Aktiv";
    case "CANCELLED":
      return "Kansellert";
    case "STOPPED":
      return "Avsluttet";
    default:
      return status;
  }
}
