import { useEffect, useState } from 'react';
import axios from 'axios';
import { compResponse } from '../types';
import './CompetitionTable.css';

export function CompetitionTable() {
  const [loading, setLoading] = useState<boolean>(false);
  const [norwayCompData, setNorwayCompData] = useState<compResponse[]>([]);
  const [worldCompData, setWorldCompData] = useState<compResponse[]>([]);

  const getCompData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_KONKURRANSE_KEY}`)
        .then(response => setNorwayCompData(response.data));
      await axios.get(`${process.env.REACT_APP_VERDENSKONKURRANSE_KEY}`)
        .then(response => setWorldCompData(response.data));

    } catch (error) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      alert(message);
    }
    setLoading(false);
  }

  useEffect(() => {
    getCompData();
  }, []);

  worldCompData.splice(1);
  let compData = norwayCompData.concat(worldCompData);
  compData.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const comingComps = () => {
  return(
    <table className="compTable">
      <thead>
        <tr>
          <th>Navn</th>
          <th>Sted</th>
          <th>Dato</th>
        </tr>
      </thead>
      <tbody className="comp">{compData.map((comp: any) => {
        let compDate;
        let compElStart = new Date(comp.start_date);
        let compElEnd = new Date(comp.end_date);
        // let compVenue = comp.venue.replace(/ *\([^)]*\) */g, "").replace("[", "").replace("]", "");
        if (Date.parse(comp.start_date) === Date.parse(comp.end_date)){
          compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'});
        }
        else {
          compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'}) + " - "  +
          compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", {month: 'short'});
        }
        if(Date.parse(comp.end_date) > Date.now()){
          return(
            <tr className="compRow" key={comp.id}>
              <td className="compName"><a href={comp.url} className="compLinks">{comp.name}</a></td>
              <td className="compCity">{comp.city}</td>
              <td className="compDate">{compDate}</td>
            </tr>
          )
        }
        })}
      </tbody>
    </table>
  );
}

  //render
  return (
        <div className="Comps">
          {comingComps()}
          {loading && <p>Laster inn...</p>}
        </div>
  )
}

export default CompetitionTable;
