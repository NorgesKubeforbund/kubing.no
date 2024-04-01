import React from 'react';
import './BliMedlem.css';

function BliMedlem(): React.ReactElement<any, any> {
    return (
      <div className="BliMedlem">
        <h1 className='MainHeader'>Bli Medlem</h1>
          <div className="MainText">
            Medlemskap i Norges kubeforbund koster 100 kroner i året. Ved å bli medlem støtter du arbeidet vårt slik at vi blant annet kan arrangere flere og større konkurranser. 
            Medlem får ofte rabatt på norske konkurranser.
            <br></br>
            <br></br>
            For å bli medlem må du gjøre to ting:
            <br></br>
            For de med Vipps: betal <span className="boldText">100 kroner</span> til 24441 og merk meldingen med navn.
            <br></br>
            For de uten Vipps: overfør <span className="boldText">100 kroner</span> til kontonummer 1503.13.61831.
            <br></br>
            Deretter send en epost til medlem@kubing.no med <span className="boldText">fullt navn, e-post, telefonnummer, kjønn, adresse, og fødselsdato.</span>
            <br></br>
            <br></br>
            Om du er usikker på om du allerede er medlem, kan du sende mail til <a href="mailto:medlem@kubing.no">medlem@kubing.no</a> og spørre.
        </div>
      </div>
    );
  }
  
  export default BliMedlem;