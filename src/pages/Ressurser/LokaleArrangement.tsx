import React from 'react';
import './LokaleArrangement.css';
import ExternalLink from '../../components/ExternalLink';

function LokaleArrangement(): React.ReactElement<any, any> {

  const displayGroupedData = () => {

    type groupedData = {
      fylke: string;
      arrName: string;
      arrLink: string;
      arrText: string;
    };

    const data: groupedData[] = [
      {
        fylke: "Oslo-Viken",
        arrName: "Cube Drammen",
        arrLink: "https://www.facebook.com/groups/529099402302831/",
        arrText: "har tilbud i Drammen."
      },
      {
        fylke: "Oslo-Viken",
        arrName: "Kubing i Bærum",
        arrLink: "https://www.facebook.com/groups/2430272227122282/",
        arrText: "har tilbud i Bærum."
      },
      {
        fylke: "Oslo-Viken",
        arrName: "Romerike SpeedCubers",
        arrLink: "https://spond.com/landing/group/TSRZF",
        arrText: "har tilbud i Lillestrøm."
      },
      {
        fylke: "Rogaland",
        arrName: "Sandnes SpeedCubers",
        arrLink: "https://www.facebook.com/groups/1658988921015490",
        arrText: "har tilbud i Sandnes."
      },
      {
        fylke: "Trøndelag",
        arrName: "Nidaros Kubing",
        arrLink: "https://www.nidaroskubing.org",
        arrText: "har tilbud på Flatåsen i Trondheim."
      },
      {
        fylke: "Trøndelag",
        arrName: "NTNUI Speedcubing",
        arrLink: "https://www.facebook.com/NTNUISpeedcubing",
        arrText: "har tilbud for studenter ved NTNU i Trondheim."
      },
      {
        fylke: "Vestland",
        arrName: "Bergen Speedcubing",
        arrLink: "https://www.facebook.com/groups/773142427894936",
        arrText: "har tilbud i Bergen."
      }
    ];

    const parseData = (apiData: groupedData[]) => {
      const result = apiData.reduce((resultObj, item) => {
        if (!resultObj[item.fylke]) {
          resultObj[item.fylke] = [];
        }
        resultObj[item.fylke].push(item);
        return resultObj;
      }, {} as Record<string, groupedData[]>);
      return result;
    };
    const groupedData = parseData(data);

    return (
      <div key={"groupDataContainer"} className="allLokaleContainer">
         {Object.entries(groupedData).map(([fylke, entries]) => {
          return (
            <div key={fylke + "Container"} className="individualContainer">
              <h2 key={fylke + "Title"} className="arrTitle">{fylke}</h2>
              {entries.map((el) => {
                return (
                  <p
                    key={el.arrLink + "Text"}
                    className="arrText"
                  >
                    <ExternalLink
                      key={el.arrLink + "Link"}
                      href={el.arrLink}
                      className="arrLink"
                    >{el.arrName}
                    </ExternalLink>
                    {" " + el.arrText}</p>
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
