import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { NavBar } from '../components/Header';
import './OmOss.css';

function OmOss() {

  const [loading, setLoading] = useState<boolean>(false);
  const [brregData, setBrregData] = useState<Array<any>>([]);

  const getBrregData = async() => {
    setLoading(true);
    const response = await axios.get('https://data.brreg.no/enhetsregisteret/api/enheter/994663666/roller?beskrivelse=Styremedlem');
    setBrregData(response.data.rollegrupper[1].roller);
    /*
    brregData er nå et array med objekter: 
    [{
      type: {
        _links: {
          self: {
            href: string
          }
        },
        beskrivelse: string,
        kode: string,
      }, 
      person {
        navn: {
          fornavn: string, 
          mellomnavn: string, 
          etternavn: string,
        }, 
        erDoed: boolean, 
        fodselsdato: string
      }, 
      fratraadt: boolean, 
      rekkefolge: integer,
    }]
    */
    setLoading(false);
    return response.data;
  };

  const brregDataTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Fornavn:</th>
            <th>Mellomnavn:</th>
            <th>Etternavn:</th>
            <th>Stilling:</th>
          </tr>
        </thead>
        <tbody>
          {brregData.map((el: any) => (
            <tr key={el.person.fodelsdato}>
              <td className='fornavn'>{el.person.navn.fornavn}</td>
              <td className='mellomnavn'>{el.person.navn.mellomnavn}</td>
              <td className='etternavn'>{el.person.navn.etternavn}</td>
              <td className={el.type.beskrivelse}>{el.type.beskrivelse}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  useEffect(() => {
    getBrregData();
  }, []);

  
  return (
    <div className="OmOss">
      <NavBar/>
      <p>tekst her om oss</p>
      <div className="brreg">
        {loading && <p>Loading data...</p>}
        {brregDataTable()}
      </div>
    </div>
  );
}

export default OmOss;