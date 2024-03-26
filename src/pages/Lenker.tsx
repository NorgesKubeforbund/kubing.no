import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Lenker.css';
import ExternalLink from '../components/ExternalLink';

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
              <ExternalLink href={el[1]} className="HeaderLinks">{el[0]}</ExternalLink>
            </h2>
            <div>
              <p>
                <ExternalLink href={el[1]}>{el[2]}</ExternalLink> 
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
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'>Lenker</h1>
        </div>
        <div className="mainBody">
          {loading && <p>Laster inn...</p>}
          <div>{linkElements()}</div>
        </div>
      </div>
    </div>
  );
};

export default Linker;
