import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Butikker.css';
import {NavBar} from '../components/Header';


function Butikker(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);

  type butikkerInfo = {

  }

  const getSheetData = async(): Promise<butikkerInfo> => {
    setLoading(true);
    const response = await axios.get(`${process.env.REACT_APP_BUTIKKER_KEY}`);
    setSheetData(response.data.values);
    setLoading(false);
    return await response.data;
  }
  
  useEffect(() => {
    getSheetData();
  }, []);

  const shopElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Main">
          {
          sheetData.map((el: string[]) => (
              <div className="Element" key={el[0]}>
                <h2>
                  <a href={el[1]} style={{textDecoration: "none", color: 'black'}}>{el[0]}</a>
                </h2>
                <div>
                  <p className='butikkDetails'>
                    <a href={el[1]}>{el[2]}</a>
                    {el[3]}
                  </p>
                </div>           
              </div>                 
          ))}
      </div>
    );
  };

  return (
    <div className="Butikker">
      <NavBar/>            
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'>Butikker</h1>
          <p>
            Mange lurer på hvor de kan få tak i kuber. 
            Her er en liste med forskjellige reputable kubebutikker som vi har god erfaring med.
          </p>
        </div>
        <div className="mainBody">
          {loading && <p>Loading data...</p>}
          <div>{shopElements()}</div>
        </div>
      </div>
    </div>
  );
}

export default Butikker;
