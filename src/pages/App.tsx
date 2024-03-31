import React from 'react';
import './App.css';
import { CompetitionTable } from '../components/CompetitionTable';


function App(): React.ReactElement<any, any> {

  return (
    <div className="App">
      <div className='Main'>
        <div className='column'>
          <div className='HomeElements'>
            <div className='Main'>
              <h2 className='HomeHeader'>Norges Kubeforbund</h2>
              <body className='content'>
                Velkommen til hjemmesiden til Norges kubeforbund.
                Hvis du ønsker å lære deg å løse Rubiks kube, så har du kommet til riktig sted.
                Vi har guider som beskriver hvordan dette gjøres.
                Hvis du allerede kan løse kuben, og kan tenke deg å delta i konkurranser,
                eller møte andre som driver med konkurransekubing,
                så har du også kommet til riktig sted.
                Her kan du finne informasjon om norske konkurranser og andre arrangementer.
              </body>
              <br></br>
              <h2 className='HomeHeader'>Hva er speedkubing?</h2>
              <body className='content'>
                Speedcubing er en sport hvor målet er å løse Rubiks kube og andre liknende puslespill på kortest mulig tid.
                Flere ganger årlig arrangeres det konkurranser i Norge (og i resten av verden),
                hvor deltakerne løser Rubiks kube på tid.
              </body>
            </div>
          </div>
        </div>
        <div className='column'>
          <h2 className='CompetitionHeader'>
            <a className='CompetitionHeader' href='konkurranser'>Kommende Konkurranser</a>
          </h2>
          <body>
            {CompetitionTable()}
          </body>
        </div>
      </div>
    </div>
  );
}

export default App;
