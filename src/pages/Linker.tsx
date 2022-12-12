import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavBar } from '../components/Header';
import './Linker.css';

function Linker(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);

  const getSheetData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_LINKER_KEY}`)
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
  }
  
  useEffect(() => {
    getSheetData();
  }, []);

  const linkElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Main">
        {sheetData.map((el: string[]) => (
          <div className="Element" key={el[0]}>
            <h2>
              <a href={el[1]} style={{textDecoration: "none", color: 'black'}}>{el[0]}</a>
            </h2>
            <div>
              <p>
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
    <div className="Eksterne Ressurser">
      <NavBar/>
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'>Linker</h1>
        </div>
        <div className="mainBody">
          {loading && <p>Loading data...</p>}
          <div>{linkElements()}</div>
        </div>
      </div>
    </div>
  );
};

export default Linker;
