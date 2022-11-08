import React, { ComponentType } from 'react';
import { NavBar } from '../components/Header';
import './Konkurranser.css';
import axios from 'axios';
import {useEffect, useState} from 'react';

function Konkurranser() {

  const [loading, setLoading] = useState<boolean>(false);
  const [compData, setCompData] = useState<apiResponse[]>([]);

  type apiResponse = 
  { id: string, 
    name: string,
    start_date: string, 
    end_date: string, 
    competitor_limit: number, 
    cancelled_at: null, 
    url: string, 
    website: string,
    short_name: string, 
    city: string, 
    venue_address:string,
    venue_details: string, 
    latitude_degrees:number, 
    longitude_degrees:number, 
    country_iso2: string,
    event_ids: Array<string | number>,
    delegates: [{
      id: number,
      name: string,
      delegate_status: string,
      wca_id: string,
      gender: string,
      country_iso2: string,
      url: string,
      country: {
        id: string,
        name: string,
        continentId: string,
        iso2: string
      },
      email: string,
      region: string,
      senior_delegate_id: number,
      class: string,
      teams: [],
      avata: {
        url: string,
        pending_url: string,
        thumb_url: string,
        is_default: boolean
      }
    }],
    organizers: [{
      id: number,
      name: string,
      delegate_status: null,
      wca_id: null,
      gender: string,
      country_iso2: string,
      url: string,
      country: {
        id: string,
        name: string,
        continentId: string,
        iso2: string
      },
      class: string,
      teams: [],
      avatar: {
        url: string,
        pending_url: string,
        thumb_url: string,
        is_default: true
      }
    }],
    class: string
  }

  const getCompData = async(): Promise<apiResponse> => {
    setLoading(true);
    const response = await axios.get('https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=NO&limit=30');
    setCompData(response.data);
    setLoading(false);
    return await response.data;
  }

  useEffect(() => {
      getCompData();
  }, []);

  const comps = (): React.ReactElement<any, any> => {
    return(
      <table className="compTable">
        <thead>
          <th>Navn</th>
          <th>By</th>
          <th>Dato</th>
        </thead>
        <tbody className="comp">{compData.map((comp: apiResponse) => (                                                                  
          <tr className="compRow">
            <td className="compName"><a href={comp.url} className="compLinks">{comp.name}</a></td>
            <td className="compCity">{comp.city}</td>
            <td className="compDate">{comp.start_date}</td>
          </tr>
        ))}
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
        {comps()}
      </div>
      <br></br>
      <br></br>
    </div>
    </div>
  );
}

export default Konkurranser;