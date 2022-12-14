import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/Header';
import './Guider.css';
import Nybegynnermetode from '../media/3x3-Begynnermetode.pdf'

function Guider(): React.ReactElement<any, any> {
  const onButtonClick = () => {
    // using Java Script method to get PDF file
    fetch(Nybegynnermetode).then(response => {
      response.blob().then(blob => {
        // Creating new object of PDF file
        const fileURL = window.URL.createObjectURL(blob);
        // Setting various property values
        let alink = document.createElement('a');
        alink.href = fileURL;
        alink.download = '3x3-Begynnermetode.pdf';
        alink.click();
      })
    })
  }
  
  return (
    <div className="Guider">
      <NavBar/>
      <div className="Main">
        <div className="Intro">
          <h1 className="MainHeader">Guider</h1>
          <p className="guideVelkommen">
            For nybegynnere kan det være vanskelig å lære seg å løse kuben.
            Derfor har vi noen guider som gjør at hvem som helst kan lære seg å løse.
          </p>
        </div>
        <div className="guideContainer">
          <h2>Guide på norsk</h2>
          <p className="norskGuide">
            <button onClick={onButtonClick} className="PDFButton">
              Denne guiden
            </button> er skrevet av Ruwix.com, og oversatt til norsk av Lars Johan Folde. 
            Den beskriver en av de enkleste metodene en kan bruke for å løse kuben.
            Metoden består av få, enkle algoritmer som gjøres gjentatte ganger. 
          </p>
          <h2>Guide på engelsk</h2>
          <p className="engelskGuide">
            Det finnes flere guider for nybegynnere på engelsk, mange av de er på YouTube. En av de finner du <a href="https://www.youtube.com/watch?v=609nhVzg-5Q">her</a>
          </p>
        </div>
        </div>
    </div>
  );
}

export default Guider;