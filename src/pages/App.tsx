import React, { useEffect, useState }from 'react';
import { NavBar } from '../components/Header';
import './App.css';
import axios from 'axios';


function App(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);

  const getSheetData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_HJEM_KEY}`)
        .then(response => setSheetData(response.data.values));
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
  
  useEffect(() => {
    getSheetData();
  }, []);


  const homeElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Main">
        {sheetData.map((el: string[]) => (
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
          <div className="HomeElements">{homeElements()}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
