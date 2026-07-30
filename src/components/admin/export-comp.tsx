"use client";

import { CompResponse } from "@/types/responses";
import { formatCompDate } from "@/lib/comps";
import { UserWithWcaId } from "@/types";

async function exportCompData(id: string) {
  const res = await fetch(`/api/admin/export/comp/${id}`);
  if (!res.ok) {
    alert("Noe gikk galt");
    return;
  }
  const json = await res.json() as { nkfMembersInComp: UserWithWcaId[] };
  const content = json.nkfMembersInComp.map(person =>
    `${person.name} - ${person.wcaId}`
  ).join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function ExportComps({ norwayCompData }: { norwayCompData: CompResponse[] }) {
  return (
    <div className="flex flex-col text-center gap-4 text-xs sm:text-xl">
      <p>
        Klikk på konkurransen for å få listen over NKF medlemmer i konkurransen.
      </p>
      <div className="flex flex-row justify-center">
        <table>
          <thead>
            <tr>
              <th className="text-left">Navn</th>
              <th className="text-right">Dato</th>
            </tr>
          </thead>
          <tbody>
            {norwayCompData
              .slice()
              .reverse()
              .filter((comp: CompResponse) => Date.parse(comp.end_date) < new Date().getTime())
              .slice(0, 14)
              .map((comp: CompResponse, index: number) => {
                return (
                  <tr key={comp.id} className={`hover:bg-table-hover ${index % 2 === 0 ? "bg-table-odd" : "bg-table-even"}`}>
                    <td className="text-left">
                      <div className="flex flex-col">
                        <button
                          className="flex text-accent-text active:underline hover:underline cursor-pointer"
                          onClick={() => exportCompData(comp.id)}
                        >
                          {comp.short_name}
                        </button>
                        <span className="text-[0.85em] text-neutral-800">
                          {comp.city}
                        </span>
                      </div>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {formatCompDate(comp.start_date, comp.end_date)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExportComps;
