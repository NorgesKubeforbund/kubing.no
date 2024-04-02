import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Lenker.css';
import ExternalLink from '../../components/ExternalLink';

function Linker(): React.ReactElement<any, any> {
  type website = { name: string, href: string, linkText: string, description: string };
  const sheetData: website[] = [
    {
      name: "WCA",
      href: "https://www.worldcubeassociation.org",
      linkText: "WCA",
      description: " sine hjemmesider inneholder resultater og informasjon om alle offisielle konkurranser i hele verden. Du kan også finne profilen til alle som har deltatt på konkurranser."
    },
    {
      name: "WCA Live",
      href: "https://live.worldcubeassociation.org",
      linkText: "WCA Live",
      description: " viser resultater fra pågående konkurranser. Om du deltar på en konkurranse kan du bruke denne siden for å få oversikt om du har gått videre eller ikke."
    },
    {
      name: "Norske Speedcubers på Facebook",
      href: "https://www.facebook.com/groups/NorskeSpeedcubers",
      linkText: "Norske Speedcubers",
      description: " er den offisielle Facebook-siden for det norske kubemiljøet. Her kan du få kontakt med en stor del av kubemiljøet."
    },
    {
      name: "NKF på YouTube",
      href: "https://www.youtube.com/channel/UCfznV1sSz1o5FJAzmR87ijg",
      linkText: "NKF",
      description: " er også på YouTube. Her legges det stadig vekk ut videoer."
    },
    {
      name: "NKF på Discord",
      href: "https://discord.gg/6y6s8vB3Z4",
      linkText: "NKF",
      description: " er også på Discord. Her kan du få kontakt med en stor del av kubemiljøet."
    }
  ];

  const linkElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Main">
        {sheetData.map((el: website) => (
          <div className="Element" key={el['name']}>
            <h2>
              <ExternalLink href={el[1]} className="HeaderLinks">{el['name']}</ExternalLink>
            </h2>
            <div>
              <p>
                <ExternalLink href={el['href']}>{el['linkText']}</ExternalLink>
                {el['description']}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="EksterneRessurser">
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'>Lenker</h1>
        </div>
        <div className="mainBody">
          <div>{linkElements()}</div>
        </div>
      </div>
    </div>
  );
};

export default Linker;
