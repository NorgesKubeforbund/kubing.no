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
            <br></br>
            <div className="steg">
            <span className="boldText">Steg 1</span>
            <br></br>
              For de med Vipps: betal 100 kroner til 24441 og merk meldingen med navn.
            <br></br>
            <br></br>
              For de uten Vipps: overfør 100 kroner til kontonummer 1503.13.61831.
            </div>
            <br></br>
            <div className="steg">
            <span className="boldText">Steg 2</span>

            <br></br>
              Fyll ut <a href="https://docs.google.com/forms/d/e/1FAIpQLSdj4MXBIQWHjsECp_gma4rRzp4MfDfDtohsfU-wDVW-dsY9qA/viewform?usp=header">registreringsskjemaet</a> via google, og last opp et skjermbilde av betaling.
            <br></br>
              </div>
            <br></br>
            Om du er usikker på om du allerede er medlem, kan du sende mail til <a href="mailto:medlem@kubing.no">medlem@kubing.no</a> og spørre.
        </div>
      </div>
    );
  }
  
  export default BliMedlem;
