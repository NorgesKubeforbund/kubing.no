import React, { useEffect, useState } from 'react';
import './Rekorder.css';
import axios from 'axios';

function Rekorder(): React.ReactElement<any, any> {
  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [sheetData2, setSheetData2] = useState<string[][]>([]);
  const [norgesRekorder, setNorgesRekorderWCA] = useState<string[][]>([]);
  const [tab1, setTab1] = useState<boolean>(true);
  const [tab2, setTab2] = useState<boolean>(false);
  const [tab3, setTab3] = useState<boolean>(false);

  const getData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_NORSKEREKORDERWCA_KEY}`)
        .then(response => setSheetData(response.data.values));
      await axios.get(`${process.env.REACT_APP_NORSKEREKORDER_KEY}`)
        .then(response => setNorgesRekorderWCA(response.data.values));
      await axios.get(`${process.env.REACT_APP_NORSKEREKORDERNONWCA_KEY}`)
        .then(response => setSheetData2(response.data.values));
    } catch (error) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      alert(message);
    }
    setLoading(false);
  };

  function toggleTabs(tabName : string): void {
    if (tabName === 'tab1') {
      if (tab1 === true) return;
      setTab1(!tab1);
      setTab2(false);
      setTab3(false);
    };
    if (tabName === 'tab2') {
      if (tab2 === true) return;
      setTab1(false);
      setTab2(!tab2);
      setTab3(false);
    };
    if (tabName === 'tab3') {
      if (tab3 === true) return;
      setTab1(false);
      setTab2(false);
      setTab3(!tab3);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const displayTab = () => {
    const WCATable = (): React.ReactElement<any, any> => {
      return (
        <table className="NRTable">
          <tbody>
            {norgesRekorder.map((el: string[]) => (
            <tr key={el[0]} className="recordRow">
              <th className="Cell">{el[0]}</th>
              <td>{el[1]}</td>
              <td>{el[2]}</td>                        
              <td>{el[3]}</td>
              <td>{el[4]}</td>                             
            </tr>
            ))}                    
          </tbody>
        </table>
      );
    };
  
    const unrWCATable = (): React.ReactElement<any, any> => {
      return (
        <table className="NRTable">
          <tbody>
            {sheetData.map((el: string[]) => (
            <tr key={el[0]} className="recordRow">
              <th className="Cell">{el[0]}</th>
              <td>{el[1]}</td>
              <td>{el[2]}</td>                        
              <td>{el[3]}</td>
              <td>{el[4]}</td>                             
            </tr>
            ))}                    
          </tbody>
        </table>
      );
    };
    
    const unrNonWCATable = (): React.ReactElement<any, any> => {
      return (
        <table className="NRTable">
          <tbody>
            {sheetData2.map((el: string[]) => (
            <tr key={el[0]} className="recordRow">
              <td className="Cell"><b>{el[0]}</b></td>    
              <td>{el[1]}</td>  
              <td>{el[2]}</td> 
              <td>{el[3]}</td>  
              <td>{el[4]}</td>                            
            </tr>
            ))}                    
          </tbody>
        </table>
      );
    }

    if (tab1) return WCATable()
    if (tab2) return unrWCATable()
    if (tab3) return unrNonWCATable()
  }

  //render
  return (
    <div className="Rekorder">
      <div className="Main RekorderBody">
        <div className="intro">
          <h1 className="MainHeader">Norske Rekorder</h1>
          Her er en liste over rekordene i Norge og hvem som har de. 
          Vi har også oversikt over de uoffisielle rekordene som ikke er satt i konkurranse, 
          og noen eventer som WCA ikke holder styr på. 
        </div>
        <br></br>
        <div className="tab">
          <button className={tab1 ? "tabLinks Activated" : "tablinks"} onClick={() => toggleTabs('tab1')}>
            <h3 className="offisielleRekorder">Offisielle Rekorder</h3>
          </button>
          <button className={tab2 ? "tabLinks Activated" : "tablinks"} onClick={() => toggleTabs('tab2')}>
            <h3 className="uoffisielleRekorder">Uoffisielle Rekorder</h3>
          </button>
          <button className={tab3 ? "tabLinks Activated" : "tablinks"} onClick={() => toggleTabs('tab3')}>
            <h3 className="nonWcaRekorder">Ikke-WCA Rekorder</h3>
          </button>
        </div>
        <div className="recordTable">
          {loading ? 'Laster inn...' : displayTab()}
        </div>
        <br></br>
        <br></br>
      </div>
    </div>
  );
}

export default Rekorder;
