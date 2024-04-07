import React from 'react';
import './Guider.css';
import Nybegynnermetode from '../../media/3x3-Begynnermetode.pdf';
import ExternalLink from '../../components/ExternalLink';

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
             <a href="https://einsan.github.io">Denne guiden</a> er skrevet av Ruwix.com,
              oversatt til norsk av Lars Johan Folde, og adaptert av Einar Martin Sandvik. 
            Den beskriver en av de enkleste metodene en kan bruke for å løse kuben.
            Metoden består av få, enkle algoritmer som gjøres gjentatte ganger. 
            Du kan også laste ned en PDF-versjon av guiden <button onClick={onButtonClick} className="PDFButton">
               her.</button>
          </p>
          <h2>Guide på engelsk</h2>
          <p className="engelskGuide">
            Det finnes flere guider for nybegynnere på engelsk, mange av de er på YouTube. En av de finner du <ExternalLink href="https://www.youtube.com/watch?v=7Ron6MN45LY">her.</ExternalLink>
          </p>

        </div>
        </div>
    </div>
  );
}

export default Guider;
