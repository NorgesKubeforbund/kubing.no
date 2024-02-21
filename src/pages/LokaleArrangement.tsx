import React, {useState, useEffect } from 'react';
import axios from 'axios';
import { NavBar } from '../components/Header';
import './LokaleArrangement.css';

function LokaleArrangement(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [groupedData, setGroupedData] = useState<Record<string, any>>({});

  const getData = async () => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_LOKALEARRANGEMENT_KEY}`)
        .then(response => parseData(response.data.values));
    } catch (error) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      alert(message);
    }
    
  };

  const parseData = async (apiData: string[][]) => {
    let newObj: {
      fylke: string; 
      arrName: string; 
      arrLink: string; 
      arrText: string
    }[] = [];
    for (let i = 0; i < apiData.length; ++i) {
      newObj.push({
        fylke: apiData[i][0],
        arrName: apiData[i][1],
        arrLink: apiData[i][2],
        arrText: apiData[i][3],
      });
    };
    const resultArr = newObj.reduce(function (r: any, a) {
      r[a.fylke] = r[a.fylke] || [];
      r[a.fylke].push({
        arrName: a.arrName,
        arrLink: a.arrLink,
        arrtext: a.arrText
      });
      return r;
    }, Object.create(null));
    setGroupedData(resultArr);
    setLoading(false);
  };

  useEffect(() => {
    getData()
  }, []);

  const displayGroupedData = () => {
    return (
      <div key={"groupDataContainer"} className="allLokaleContainer">
        {Object.keys(groupedData).map((a, i) => {
          return (
            <div key={a+"Container"} className="individualContainer">
              <h2 key={a + "Title"} className="arrTitle">{a}</h2>
              {Object.values(groupedData[a]).map((el: any) => {
                const storage: string[] = Object.values(el);
                return (
                  <p 
                    key={storage[1]+"Text"} 
                    className="arrText"
                  >
                    <a 
                      key={storage[1]+"Link"} 
                      href={storage[1]} 
                      className="arrLink"
                    >{storage[0]}
                    </a>
                  {" " + storage[2]}</p>
                )
              })}
            </div>
          )})}
      </div>
    )
  }

  return (
    <div className="LokaleArrangement">
        <NavBar/>
        <div className='Main'>
          <div className='Intro'>
            <h1 className='MainHeader'> Lokale Arrangement</h1>
            Ønsker du å finne andre kubere å løse sammen med? 
            Det finnes flere lokale arragement rundt omkring i landet som møtes jevnlig for å kube sammen.
            Mange av de største byene har tilbud, men du kan også spørre 
            på facebook-siden <a href='https://www.facebook.com/groups/NorskeSpeedcubers' target='_blank' rel='noopener'>Norske SpeedCubers</a> om det er noen kubere i nærheten av deg.
            Kanskje du kan bidra til å skape et tilbud for ditt lokalmiljø?
          </div>
          {loading && <p>Laster inn...</p>}
          {displayGroupedData()}
      </div>
    </div>
  );
}

export default LokaleArrangement;
