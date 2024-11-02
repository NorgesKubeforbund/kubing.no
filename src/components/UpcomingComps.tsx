import "./UpcomingComps.css";
import { useEffect, useState } from "react";
import { compResponse } from "../types";
import ExternalLink from "./ExternalLink";
import { formatCompDate } from "../utils/dateUtils";
import { getNorwayCompData } from "../utils/wcaUtils";

const UpcomingComps: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [norwayCompData, setNorwayCompData] = useState<compResponse[]>([]);
  const cacheDuration = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    getNorwayCompData(setLoading, setNorwayCompData, cacheDuration);
  }, []);

  const upcomingComps = () => {
    return (
      <table className="compTable">
        <thead>
          <tr>
            <th>Navn</th>
            <th>Sted</th>
            <th>Dato</th>
          </tr>
        </thead>
        <tbody className="comp">
          {norwayCompData
            .slice()
            .map((comp: any) => {
              if (Date.parse(comp.end_date) > Date.now()) {
                return (
                  <tr className="compRow" key={comp.id}>
                    <td className="compName">
                      <ExternalLink href={comp.url} className="compLinks">
                        {comp.name}
                      </ExternalLink>
                    </td>
                    <td className="compCity">{comp.city}</td>
                    <td className="compDate">
                      {formatCompDate(comp.start_date, comp.end_date)}
                    </td>
                  </tr>
                );
              }
            })}
        </tbody>
      </table>
    );
  };

  //render
  return (
    <div className="Comps">
      {upcomingComps()}
      {loading && <p>Laster inn...</p>}
    </div>
  );
}

export default UpcomingComps;
