
import { useEffect, useState } from "react";
import { compResponse } from "../types";
import "./PastComps.css";
import ExternalLink from "./ExternalLink";
import { formatCompDate } from "../utils/dateUtils";
import { getNorwayCompData } from "../utils/wcaUtils";

const PastComps: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [norwayCompData, setNorwayCompData] = useState<compResponse[]>([]);
  const cacheDuration = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    getNorwayCompData(setLoading, setNorwayCompData, cacheDuration);
  }, []);

  const pastComps = () => {
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
            .reverse()
            .filter((comp: any) => Date.parse(comp.end_date) < Date.now())
            .slice(0, 14)
            .map((comp: any) => {
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
            })}
        </tbody>
      </table>
    );
  };

  //render
  return (
    <div className="Comps">
      {pastComps()}
      {loading && <p>Laster inn...</p>}
    </div>
  );
}

export default PastComps;
