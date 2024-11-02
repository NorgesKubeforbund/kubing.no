// Rekorder.tsx
import React from 'react';
import './Rekorder.css';
import RecordsTable from '../components/RecordsTable';

function Rekorder(): React.ReactElement {
  return (
    <div className="Rekorder">
      <div className="Main RekorderBody">
        <div className="intro">
          <h1 className="MainHeader">Norske Rekorder</h1>
          Her er en liste over rekordene i Norge og hvem som har de.
          Vi har også oversikt over de uoffisielle rekordene som ikke er satt i konkurranse,
          og noen eventer som WCA ikke holder styr på.
        </div>
        <br />
        <RecordsTable />
        <br />
        <br />
      </div>
    </div>
  );
}

export default Rekorder;