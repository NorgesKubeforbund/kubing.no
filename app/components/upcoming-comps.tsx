import Link from "next/link";
import { CompResponse } from "../utils/response-types";
import Title from "../ui/title";
import { formatCompDate, getNorwayCompData } from "../utils/comp-utils";

async function UpcomingComps() {
  const norwayCompData = await getNorwayCompData();
  return (
    <div className="flex flex-col text-center gap-4 text-xs sm:text-xl">
      <Title>Kommende Konkurranser</Title>
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
              .map((comp: CompResponse, index: number) => {
                if (Date.parse(comp.end_date) > new Date().getTime()) {
                  return (
                    <tr key={comp.id} className={`hover:bg-table-hover ${(index+1) % 2 === 0 ? "bg-table-odd" : "bg-table-even"}`}>
                      <td className="text-left">
                        <div className="flex flex-col">
                          <Link
                            className="text-accent-text hover:underline"
                            href={comp.url}
                          >
                            {comp.short_name}
                          </Link>
                            <span className="text-[0.85em] text-gray-800">
                              {comp.city}
                            </span>
                          </div>
                        </td>
                      <td className="text-right whitespace-nowrap">
                        {formatCompDate(comp.start_date, comp.end_date)}
                      </td>
                    </tr>
                  );
                }
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UpcomingComps;
