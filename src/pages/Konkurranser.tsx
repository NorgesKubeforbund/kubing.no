import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavBar } from '../components/Header';
import { compResponse} from '../types';
import './Konkurranser.css';

function Konkurranser() {
  const [loading, setLoading] = useState<boolean>(false);
  const [compData, setCompData] = useState<compResponse[]>([]);

  const getCompData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_KONKURRANSE_KEY}`)
        .then(response => setCompData(response.data))
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

  const commingComps = () => {
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
          let compDate;
          let compElStart = new Date(comp.start_date);
          let compElEnd = new Date(comp.end_date);
          if (Date.parse(comp.start_date) === Date.parse(comp.end_date)) {
            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'});
          } else { 
            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'}) + " - "  + 
            compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", {month: 'short'});
          }
          if (Date.parse(comp.end_date) > Date.now()) {
            return (                                  
              <tr className="compRow" key={comp.id}>
                <td className="compName"><a href={comp.url} className="compLinks">{comp.name}</a></td>
                <td className="compCity">{comp.city}</td>
                <td className="compDate">{compDate}</td>
              </tr>
            )}
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
        <tbody className="comp">
          {compData.map((comp: any) => {
            let compDate;
            let compElStart = new Date(comp.start_date);
            let compElEnd = new Date(comp.end_date);
            if (Date.parse(comp.start_date) === Date.parse(comp.end_date)) {
              compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'});
            } else { 
              compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'}) + " - "  + 
              compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", {month: 'short'});
            }
            if(Date.parse(comp.end_date) < Date.now()) {
              return (                                  
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
    <div className="Konkurranser">
      <NavBar/>
      <div className="Main">
        <div className="arrangere">
          <p>Ønsker du å arrangere en konkurranse?</p>
        </div>
        <h1 className='MainHeader'>Kommende Konkurranser</h1>
        <div className="Comps">
          {loading && <p>Loading data...</p>}
          {commingComps()}
        </div>
        <h1 className='MainHeader'>Tidligere Konkurranser</h1>
        <div className="Comps">
          {loading && <p>Loading data...</p>}
          {pastComps()}
        </div>
        <br></br>
        <br></br>
      </div>
    </div>
  );
}

export default Konkurranser;
