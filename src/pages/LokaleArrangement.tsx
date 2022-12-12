import axios from 'axios';
import { group } from 'console';
import React, {useState, useEffect } from 'react';
import { NavBar } from '../components/Header';
import './LokaleArrangement.css';

function LokaleArrangement(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(true);
  const [apiData, setApidata] = useState<string[][]>([]);
  const [groupedData, setGroupedData] = useState<Record<string, any>>({});

  const getData = async () => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_LOKALEARRANGEMENT_KEY}`)
        .then(response => setApidata(response.data.values))
        .then(parseData);
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

  const parseData = async () => {
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
  };

  useEffect(() => {
    getData()
  }, [groupedData]);

  const displayGroupedData = () => {
    return (
      <div>
        {Object.keys(groupedData).map((a, i) => {
          return (
            <div>
              <h2 key={a + "Title"}>{a}</h2>
              {Object.values(groupedData[a]).map((el: any) => {
                const storage: string[] = Object.values(el);
                return (
                  <p key={storage[1]+"Text"}><a key={storage[1]+"Link"} href={storage[1]}>{storage[0]}</a>{" " + storage[2]}</p>
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
            Det finnes flere lokale arragement rundt omkring i landet som møtes gjevnlig for å kube sammen.
            Mange av de størtse byene har tilbud, men du kan også spørre 
            på facebook-siden <a href='https://www.facebook.com/groups/NorskeSpeedcubers' target='_blank' rel='noopener'>Norske SpeedCubers</a> om det er noen kubere i nærheten av deg.
            Kanskje du kan bidra til å skape et tilbud for ditt lokalmiljø?
          </div>
          {loading && <p>we are loading data</p>}
          {displayGroupedData()}
          
            {/*
            <div className='LokaltArrangement'>
              <h2>Oslo-viken</h2>
              <a href='https://www.facebook.com/groups/529099402302831/' target='_blank' rel='noopener'>Cube Drammen</a> har tilbud i Drammen.<br></br>
              <a href='https://www.facebook.com/groups/2430272227122282/' target='_blank' rel='noopener'>Kubing i Bærum</a> har tilbud i Bærum.<br></br>
              <a href='https://spond.com/landing/group/TSRZF' target='_blank'>Romerike SpeedCubers</a> har tilbud i Lillestrøm.
            </div>
            <div className='LokaltArrangement'>
              <h2>Rogaland</h2>
              <a href='https://www.facebook.com/groups/1658988921015490' target='_blank' rel='noopener'>Sandnes SpeedCubers</a> har tilbud i Sandnes.
            </div>
            <div className='LokaltArrangement'>
              <h2>Trøndelag</h2>
              I Trondheim er det to forskjellige tilbud:<br></br>
              <a href='https://www.facebook.com/groups/1345849928919723' target='_blank' rel='noopener'>Flatåsen Kubeklubb</a> har tilbud.<br></br>
              <a href='https://www.facebook.com/NTNUISpeedcubing' target='_blank' rel='noopener'>NTNUI Speedcubing</a> har tilbud.
            </div>
            */}
      </div>
    </div>
  );
}

export default LokaleArrangement;