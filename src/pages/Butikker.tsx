import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Butikker.css';
import ExternalLink from '../components/ExternalLink';


function Butikker(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);

  const getSheetData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_BUTIKKER_KEY}`)
        .then(response => setSheetData(response.data.values))
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

  const shopElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Main">
          {
          sheetData.map((el: string[]) => (
              <div className="Element" key={el[0]}>
                <h2>
                  <ExternalLink href={el[1]} className="HeaderLinks">{el[0]}</ExternalLink>
                </h2>
                <div>
                  <p className='butikkDetails'>
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
    <div className="Butikker">
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'>Butikker</h1>
          <p>
            Mange lurer på hvor de kan få tak i kuber. 
            Her er en liste med forskjellige kubebutikker som vi har god erfaring med.
          </p>
        </div>
        <div className="mainBody">
          {loading && <p>Laster inn...</p>}
          <div>{shopElements()}</div>
        </div>
      </div>
    </div>
  );
}

export default Butikker;
