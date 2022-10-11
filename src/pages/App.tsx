import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={""} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/pages/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"


        >
          Learn React

        </a>
        <button onClick={() => {
          window.location.href = "./Butikker"
          }}>Butikker</button>
         

          <button onClick={() => {
          window.location.href = "./Guider"
          }}>Guider</button>
          

          <button onClick={() => {
          window.location.href = "./Konkurranser"
          }}>Konkurranser</button>
      
          
          <button onClick={() => {
          window.location.href = "./OmOss"
          }}>Om oss</button>

          
          <button onClick={() => {
          window.location.href = "./Rekorder"
          }}>Rekorder</button>


          <button onClick={() => {
          window.location.href = "./EksterneRessurser"
          }}>Eksterne ressurser</button>


          <button onClick={() => {
          window.location.href = "./LokaleArrangement"
          }}>Lokale arrangement</button>
          
      </header>
    </div>
  );
}

export default App;

/*export default function App() {
  return(
    <div> hello world</div>
  );
}*/
