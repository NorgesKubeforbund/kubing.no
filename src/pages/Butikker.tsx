import React from 'react';
import './Butikker.css';
import {NavBar} from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';


function Butikker(): React.ReactElement<any, any> {

const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);


  type butikkerInfo = {

  }

  const getSheetData = async(): Promise<butikkerInfo> => {
    setLoading(true);
    const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1Azvglk7gcyK0ql8_LRPHwmj0KQBzl5wrpiiYVEn3Frc/values/Butikker?key=AIzaSyACiTiM4Kz8HfzwUkjXJushOi1YBgcjmKw');
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
                <h2>{el[0]}</h2>
                <div> <a href={el[1]}>{el[2]}</a> {el[3]}</div>           
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
                    Mange lurer på hvor de kan få tak i kuber.
                    <br></br>
                    Her er en liste med forskjellige reputable kubebutikker som vi har god erfaring med.
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