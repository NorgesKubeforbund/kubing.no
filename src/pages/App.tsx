import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/Header';
import { Footer } from '../components/Footer';
import './App.css';
import { Link } from 'react-router-dom';


function App(): React.ReactElement<any, any> {

  return (
    <div className="App">
      <NavBar />
      <div className='Main'>
        <div className='Intro'>
          <h1 className='MainHeader'>Hjem</h1>
        </div>
        <div className='MainBody'>
          <div className='HomeElements'>
            <div className='Main'>
              <h2>Velkommen</h2>
              <body>
                Velkommen til hjemmesiden til Norges kubeforbund.
                Hvis du ønsker å lære deg å løse Rubiks kube, så har du kommet til riktig sted.
                Vi har guider som beskriver hvordan dette gjøres.
                Hvis du allerede kan løse kuben, og kan tenke deg å delta i konkurranser,
                eller møte andre som driver med konkurransekubing,
                så har du også kommet til riktig sted.
                Her kan du finne informasjon om norske konkurranser og andre arrangementer.
              </body>
              <h2>Hva er 'speedcubing'?</h2>
              <body>
                Speedcubing er en sport hvor målet er å løse Rubiks kube og andre liknende puslespill på kortest mulig tid.
                Flere ganger årlig arrangeres det konkurranser i Norge (og i resten av verden),
                hvor deltakerne løser Rubiks kube på tid.
              </body>
              <h2>Kommende konkurranser</h2>
              <body>
                Kommende konkurranser finner du <Link to='/konkurranser'>her.</Link>
              </body>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
