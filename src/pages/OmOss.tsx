import React, { useEffect, useState }from 'react';
import axios from 'axios';
import { NavBar } from '../components/Header';
import ContactForm from '../components/ContactForm'
import './OmOss.css';
import { brregResponse } from '../types';

function OmOss(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [brregData, setBrregData] = useState<brregResponse[]>([]);

  const getBrregData = async(): Promise<void> => {
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
            if(el.person.navn.mellomnavn !== undefined){    
              mellomNavn = el.person.navn.mellomnavn;
            }
            return(
              <tr key={el.person.fodselsdato}>
                <td className='fornavn'>{el.person.navn.fornavn + " " + mellomNavn + " " + el.person.navn.etternavn }</td> 
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
      <NavBar/>
      <div className="Main">
        <div className="intro">
          <h1 className="MainHeader">Om oss</h1>
          Norges kubeforbund jobber med å fremme interessen for løsing av Rubiks kube og andre lignende puslespill i Norge.
          Dette gjøres ved å arrangere konkurranser og bidra til å skape et sosialt miljø.
          Om du synes dette høres spennende ut, kan du bli medlem eller finne et lokalt miljø å bli kjent med.
          Lokale miljø i ditt nærområdet finner du i lokale arrangement-taben i menyen over.
          <br></br>
          
        </div>
        <div className="Element">
          <h2>Bli medlem</h2>
          <div>
            Medlemskap i Norges kubeforbund koster 100 kroner i året. Ved å bli medlem støtter du arbeidet vårt slik at vi blant annet kan arrangere flere og større konkurranser. 
            Medlem får ofte rabatt på norske konkurranser.
            <br></br>
            <br></br>
            For å bli medlem må du gjøre to ting:
            <br></br>
            For de med Vipps: betal <span className="boldText">100 kroner</span> til 24441 og merk meldingen med navn.
            <br></br>
            For de uten Vipps: overfør <span className="boldText">100 kroner</span> til kontonummer 1503.13.61831.
            <br></br>
            Deretter send en epost til medlem@kubing.no med <span className="boldText">fullt navn, e-post, telefonnummer, kjønn, adresse, og fødselsdato.</span>
            <br></br>
            <br></br>
            Om du er usikker på om du allerede er medlem, kan du sende mail til <a href="mailto:medlem@kubing.no">medlem@kubing.no</a> og spørre.

            </div>
        </div>
        <div className="element">
          <h2>Styret</h2>
          <div className="brreg">
            {loading && <p>Loading data...</p>}
            {brregDataTable()}
          </div>
        </div>
        <ContactForm serviceID={'service_onnkkgn'} />
        <br></br>
        <br></br>
      </div>
    </div>
  );
}

export default OmOss;
