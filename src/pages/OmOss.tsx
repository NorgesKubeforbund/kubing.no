import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { NavBar } from '../components/Header';
import ContactForm from '../components/ContactForm'
import './OmOss.css';

function OmOss(): React.ReactElement<any, any> {

  const [loading, setLoading] = useState<boolean>(false);
  const [brregData, setBrregData] = useState<apiResponse[]>([]);

  type apiResponse = {
    type: {
      _links: {
        self: {
          href: string
        },
      },
      beskrivelse: string,
      kode: string,
    },
    person: {
      navn: {
        fornavn: string, 
        mellomnavn: string, 
        etternavn: string,
      }, 
      erDoed: boolean, 
      fodselsdato: string
    }, 
    fratraadt: boolean, 
    rekkefolge: number,
  };

  const getBrregData = async(): Promise<apiResponse> => {
    setLoading(true);
    const response = await axios.get(`${process.env.REACT_APP_OMOSS_KEY}`);
    setBrregData(response.data.rollegrupper[1].roller);
    setLoading(false);
    return response.data;
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
          {brregData.map((el: apiResponse) => {
            let mellomNavn = "";
            if(el.person.navn.mellomnavn !== undefined){    
              mellomNavn = el.person.navn.mellomnavn;
            }
          return(
            <tr key={el.person.fodselsdato}>
              <td className='fornavn'>{el.person.navn.fornavn + " " + mellomNavn + " " + el.person.navn.etternavn }</td> 
              <td className={el.type.beskrivelse}>{el.type.beskrivelse}</td>
            </tr>
          )})}
        </tbody>
      </table>
    )
  }

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
          Om du synest dette hørest spennende ut, så kan du bli medlem eller finne et lokalt miljø å bli kjendt med.
          Lokale miljø i ditt nærområdet finner du i lokale arrangement-taben i menyen over.
        </div>
        <div className="Element">
          <h2>Bli medlem</h2>
          <div>
            Medlemskap i Norges kubeforbund koster 50 kroner i året. Ved å bli medlem støtter du arbeidet vårt slik at vi blant annet kan arrangere flere og større konkurranser.
            For å bli medlem må du gjøre to ting:
            <br></br>
            1. 
            <br></br>
            Sende en epost til medlem@kubing.no med <span className="boldText">fult navn, e-post, telefonnummer, kjønn, adresse, og fødselsdato.</span>
            <br></br>
            2. 
            <br></br>
            Overføre <span className="boldText">50 kroner</span> til Norges Kubeforbund. <span className="boldText">Merk med fullt navn på personen som skal melde seg inn!</span> (kontonummer: 1503.13.61831 Vipps-nummer: 24441)
          </div>
        </div>
        <div className="element">
          <h2>Styret</h2>
          <div className="brreg">
            {loading && <p>Loading data...</p>}
            {brregDataTable()}
          </div>
        </div>

        <div className="Element">
          <h2>Kontakt oss</h2>
          <div>
            Kontakt oss med dette skjemaet: kontakt@kubing.no
            <ContactForm serviceID={'service_x020olk'} />
          </div>
        </div>

        <br></br>
        <br></br>
      </div>
    </div>
  );
}

export default OmOss;