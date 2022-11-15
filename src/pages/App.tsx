import React, { useLayoutEffect } from 'react';
import { NavBar } from '../components/Header';
import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App(): React.ReactElement<any, any> {

  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);


  type hjemInfo = {

  }

  const getSheetData = async(): Promise<hjemInfo> => {
    setLoading(true);
    const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1Azvglk7gcyK0ql8_LRPHwmj0KQBzl5wrpiiYVEn3Frc/values/Hjem?key=AIzaSyACiTiM4Kz8HfzwUkjXJushOi1YBgcjmKw');
    setSheetData(response.data.values);
    setLoading(false);
    return await response.data;
  }
  
  useEffect(() => {
    getSheetData();
  }, []);


  const homeElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Main">
          {
          sheetData.map((el: string[]) => (
              <div className="Element" key={el[0]}>
                <h2>{el[0]}</h2>
                <p>{el[1]}</p>            
              </div>                 
          ))}
      </div>
    );
  };


  return (
    <div className="App">
      <NavBar />
      <div className='Main'>
          <div className='Intro'>
              <h1 className='MainHeader'>Hjem</h1>
  
          </div>
          <div className="MainBody">
            {loading && <p>Loading data...</p>}
            <div className="">{homeElements()}</div>
          </div>
      </div>
    </div>
  );
}

export default App;

