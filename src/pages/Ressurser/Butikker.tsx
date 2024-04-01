import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Butikker.css';
import ExternalLink from '../../components/ExternalLink';


function Butikker(): React.ReactElement<any, any> {
  type store = {name: string, href: string, description: string};
  const sheetData: store[] = [
    {
      name: "Cuboss",
      href: "https://cuboss.se",
      description:" er en kubebutikk lokalisert i Sverige. De har et bra utvalg og kort leveringstid."
    },
    {
      name: "Kuber og Kort",
      href: "https://kuberogkort.no",
      description: " er den nyeste kubebutikken i Norge. De har kort leveringstid og ingen importkostnader."
    },
    {
      name: "Nordicube",
      href: "https://nordicube.com",
      description: " er den eldste norske kubebutikken. De har kort leveringstid og ingen importkostnader. "
    },
    {
      name: "SpeedCubeShop",
      href: "https://speedcubeshop.com",
      description: " er en kubebutikk lokalisert i USA. De har et stort utvalg, men kan ha noe lang leveringstid siden kubene kommer fra USA."
    },
    {
      name: "The Cubicle",
      href: "https://www.thecubicle.com",
      description: " er en kubebutikk lokalisert i USA. De har et stort utvalg, men også lengre leveringstid siden kubene sendes fra USA."
    }
  ];

  const shopElements = (): React.ReactElement<any, any> => {
    return (
      <div className="Butikker">
          {
          sheetData.map((el: store) => (
              <div className="Element" key={el['name']}>
                <h2>
                  <ExternalLink href={el['href']} className="HeaderLinks">{el['name']}</ExternalLink>
                </h2>
                <div>
                  <p className='butikkDetails'>
                    <ExternalLink href={el['href']}>{el['name']}</ExternalLink>
                    {el['description']}
                  </p>
                </div>           
              </div>                 
          ))}
      </div>
    );
  };

  return (
    <div className="Butikker">
      <div className='Butikker'>
        <div className='Intro'>
          <h1 className='MainHeader'>Butikker</h1>
          <p>
            Mange lurer på hvor de kan få tak i kuber. 
            Her er en liste med forskjellige kubebutikker som vi har god erfaring med.
          </p>
        </div>
        <div className="mainBody">
          <div>{shopElements()}</div>
        </div>
      </div>
    </div>
  );
}

export default Butikker;
