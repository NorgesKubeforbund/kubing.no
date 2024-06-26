import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { compResponse } from '../types';
import './Konkurranser.css';
import { HashLink as Link } from 'react-router-hash-link';
import ExternalLink from '../components/ExternalLink';

function Konkurranser() {
  const [loading, setLoading] = useState<boolean>(false);
  const [norwayCompData, setNorwayCompData] = useState<compResponse[]>([]);
  const [worldCompData, setWorldCompData] = useState<compResponse[]>([]);

  const getCompData = async (): Promise<void> => {
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
        <tbody className="comp">{compData.map((comp: any) => {
          let compDate: string;
          let compElStart = new Date(comp.start_date);
          let compElEnd = new Date(comp.end_date);
          if (Date.parse(comp.start_date) === Date.parse(comp.end_date)) {
            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", { month: 'short' });
          }
          else {
            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", { month: 'short' }) + " - " +
              compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", { month: 'short' });
          }
          if (Date.parse(comp.end_date) > Date.now()) {
            return (
              <tr className="compRow" key={comp.id}>
                <td className="compName"><ExternalLink href={comp.url} className="compLinks">{comp.name}</ExternalLink></td>
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
        <tbody className="comp">{compData.reverse().map((comp: any) => {
          compData = compData.splice(Math.min(compData.length, 14));
          let compDate: string;
          let compElStart = new Date(comp.start_date);
          let compElEnd = new Date(comp.end_date);
          if (Date.parse(comp.start_date) === Date.parse(comp.end_date)) {
            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", { month: 'short' });
          }
          else {
            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", { month: 'short' }) + " - " +
              compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", { month: 'short' });
          }
          if (Date.parse(comp.end_date) < Date.now()) {
            return (
              <tr className="compRow" key={comp.id}>
                <td className="compName"><ExternalLink href={comp.url} className="compLinks">{comp.name}</ExternalLink></td>
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

  const arrangereKonkurranse = () => {
    return (
      <div className="delegateList">
        <br></br>
        <br></br>
        <h1 id='arrangereKonkurranse' className='MainHeader'>Arrangere Konkurranse</h1>
        Det er mye en burde tenke gjennom før en velger å arrangere sin egen konkurranse.
        Først vil vi anbefale å være på noen konkurranser selv, slik at du vet hvordan de gjennomføres.
        WCA har mange ressurser som kan hjelpe til med å arrangere konkurranser. Disse kan du finne via lenken under.
        <br></br>
        <br></br>
        <ExternalLink className='arrangereLink' href="https://www.worldcubeassociation.org/organizer-guidelines">Organizer-Guidelines from WCA</ExternalLink>
        <br></br>
        <br></br>
        Etter at du har skaffet deg et overblikk over hvordan en arrangerer en konkurranse og laget en plan for hvordan du ønsker å
        gjennomføre din konkurranse, må du ta kontakt med en delegat. Alle norske delegater er listet nedenfor.
        <br></br>
        <br></br>
        <h2 className='delegateHeader'>Norske Delegater</h2>
        <div className='delegateColumn'>
          <strong>
            <ExternalLink className='delegateContact' href="mailto:ubredland@worldcubeassociation.org,vklungre@worldcubeassociation.org,ironmeadow@gmail.com">Delegater i Oslo - Kontakt</ExternalLink>
          </strong>
          <br></br>
          <br></br>
          <ExternalLink className='delegate' href="https://www.worldcubeassociation.org/persons/2012BRED01">Ulrik Bredland</ExternalLink>
          <br></br>
          <ExternalLink className='delegate' href="https://www.worldcubeassociation.org/persons/2008KLUN01">Vidar Klungre</ExternalLink>
          <br></br>
          <ExternalLink className='delegate' href="https://www.worldcubeassociation.org/persons/2018JERN01">Jakob Jernsletten</ExternalLink>
        </div>
        <div className='delegateColumn'>
          <strong>
            <ExternalLink className='delegateContact' href="mailto:jbruun@worldcubeassociation.org,lfolde@worldcubeassociation.org">Delegater i Trondheim - Kontakt</ExternalLink>
          </strong>
          <br></br>
          <br></br>
          <ExternalLink className='delegate' href="https://www.worldcubeassociation.org/persons/2018FOLD01">Lars Johan Folde</ExternalLink>
          <br></br>
          <ExternalLink className='delegate' href="https://www.worldcubeassociation.org/persons/2018BRUU01">Jacob Oliver Bruun</ExternalLink>
        </div>
        <div className='delegateColumn'>
          <strong>
            <ExternalLink className='delegateContact' href="mailto:ejohnsen@worldcubeassociation.org">Delegater i Nord Dakota, USA - Kontakt</ExternalLink>
          </strong>
          <br></br>
          <br></br>
          <ExternalLink className='delegate' href="https://www.worldcubeassociation.org/persons/2018JOHN03">Elmer Alexander Johnsen</ExternalLink>
        </div>
      </div>
    );
  }

  //render
  return (
    <div className="Konkurranser">
      <div className="Main">
        <div className="arrangere">
          <br></br>
          <Link className='arrangereLink' to='#arrangereKonkurranse'>Ønsker du å arrangere en konkurranse?</Link>
        </div>
        <div>
          <h1 className='MainHeader'>Kommende Konkurranser</h1>
          <div className="Comps">
            {upcomingComps()}
            {loading && <p>Laster inn...</p>}
          </div>
          <h1 className='MainHeader'>Tidligere Konkurranser</h1>
          <div className="Comps">
            {pastComps()}
            {loading && <p>Laster inn...</p>}
          </div>
        </div>
        {arrangereKonkurranse()}
      </div>
    </div>
  )
}

export default Konkurranser;
