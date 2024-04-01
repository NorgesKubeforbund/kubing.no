import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LokaleArrangement.css';
import ExternalLink from '../../components/ExternalLink';

function LokaleArrangement(): React.ReactElement<any, any> {

  const displayGroupedData = () => {

    const data: string[][] = [
      [
        "Oslo-Viken",
        "Cube Drammen",
        "https://www.facebook.com/groups/529099402302831/",
        "har tilbud i Drammen."
      ],
      [
        "Oslo-Viken",
        "Kubing i Bærum",
        "https://www.facebook.com/groups/2430272227122282/",
        "har tilbud i Bærum."
      ],
      [
        "Oslo-Viken",
        "Romerike SpeedCubers",
        "https://spond.com/landing/group/TSRZF",
        "har tilbud i Lillestrøm."
      ],
      [
        "Rogaland",
        "Sandnes SpeedCubers",
        "https://www.facebook.com/groups/1658988921015490",
        "har tilbud i Sandnes."
      ],
      [
        "Trøndelag",
        "Nidaros Kubing",
        "https://www.nidaroskubing.org",
        "har tilbud på Flatåsen i Trondheim."
      ],
      [
        "Trøndelag",
        "NTNUI Speedcubing",
        "https://www.facebook.com/NTNUISpeedcubing",
        "har tilbud for studenter ved NTNU i Trondheim."
      ],
      [
        "Vestland",
        "Bergen Speedcubing",
        "https://www.facebook.com/groups/773142427894936",
        "har tilbud i Bergen."
      ]
    ];

    const parseData = (apiData: string[][]) => {
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
      return resultArr;
    };
    const groupedData = parseData(data);

    return (
      <div key={"groupDataContainer"} className="allLokaleContainer">
        {Object.keys(groupedData).map((a, i) => {
          return (
            <div key={a + "Container"} className="individualContainer">
              <h2 key={a + "Title"} className="arrTitle">{a}</h2>
              {Object.values(groupedData[a]).map((el: any) => {
                const storage: string[] = Object.values(el);
                return (
                  <p
                    key={storage[1] + "Text"}
                    className="arrText"
                  >
                    <ExternalLink
                      key={storage[1] + "Link"}
                      href={storage[1]}
                      className="arrLink"
                    >{storage[0]}
                    </ExternalLink>
                    {" " + storage[2]}</p>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="LokaleArrangement">
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'> Lokale Arrangement</h1>
          Ønsker du å finne andre kubere å løse sammen med?
          Det finnes flere lokale arragement rundt omkring i landet som møtes jevnlig for å kube sammen.
          Mange av de største byene har tilbud, men du kan også spørre
          på facebook-siden <ExternalLink href='https://www.facebook.com/groups/NorskeSpeedcubers'>Norske SpeedCubers</ExternalLink> om det er noen kubere i nærheten av deg.
          Kanskje du kan bidra til å skape et tilbud for ditt lokalmiljø?
        </div>
        {displayGroupedData()}
      </div>
    </div>
  );
}

export default LokaleArrangement;
