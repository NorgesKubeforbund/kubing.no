import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContactForm from '../components/ContactForm'
import './OmOss.css';
import { brregResponse } from '../types';
import { Link } from 'react-router-dom';

function OmOss(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [brregData, setBrregData] = useState<brregResponse[]>([]);

  const getBrregData = async (): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_OMOSS_KEY}`)
        .then(response => setBrregData(response.data.rollegrupper[1].roller))
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
  };

  const brregDataTable = (): React.ReactElement<any, any> => {
    return (
      <table className="styreTable">
        <thead>
          <tr>
            <th>Navn:</th>
            <th>Stilling:</th>
          </tr>
        </thead>
        <tbody>
          {brregData.map((el: brregResponse) => {
            let mellomNavn = "";
            if (el.person.navn.mellomnavn !== undefined) {
              mellomNavn = el.person.navn.mellomnavn;
            }
            return (
              <tr key={el.person.fodselsdato}>
                <td className='fornavn'>{el.person.navn.fornavn + " " + mellomNavn + " " + el.person.navn.etternavn}</td>
                <td className={el.type.beskrivelse}>{el.type.beskrivelse}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    getBrregData();
  }, []);

  //render
  return (
    <div className="OmOss">
      <div className="Main">
        <div className="intro">
          <h1 className="MainHeader">Om Oss</h1>
          Norges kubeforbund jobber med å fremme interessen for løsing av Rubiks kube og andre lignende puslespill i Norge.
          Dette gjøres ved å arrangere konkurranser og bidra til å skape et sosialt miljø.
          Om du synes dette høres spennende ut, kan du bli medlem eller finne et lokalt miljø å bli kjent med.
          Du kan medlem deg inn <Link to='/BliMedlem'>her</Link> og finne en oversikt over lokale kubemiljø <Link to='/Ressurser/LokaleArrangement'>her.</Link>
          <br></br>
        </div>
        <div className="element">
          <h2>Styret</h2>
          <div className="brreg">
            {loading && <p>Laster inn...</p>}
            {brregDataTable()}
          </div>
        </div>
        <div id="kontaktOss">
          <ContactForm serviceID={'service_onnkkgn'} />
        </div>
        <br></br>
        <br></br>
      </div>
    </div>
  );
}

export default OmOss;
