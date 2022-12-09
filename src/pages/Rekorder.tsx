import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/Header';
import './Rekorder.css';
import axios from 'axios';

function Rekorder(): React.ReactElement<any, any> {
  const [loadingWCA, setLoadingWCA] = useState<boolean>(false);
  const [loadingNonWCA, setLoadingNonWCA] = useState<boolean>(false);
  const [loadingOfficial, setLoadingOfficial] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [sheetData2, setSheetData2] = useState<string[][]>([]);
  const [norgesRekorder, setNorgesRekorderWCA] = useState<string[][]>([]);
  const [tab1, setTab1] = useState<boolean>(true);
  const [tab2, setTab2] = useState<boolean>(false);
  const [tab3, setTab3] = useState<boolean>(false);
  

  type wcaRekorder = {
    national_records: {
      Norway: { 
        222: { single: number, average: number },
        333: { single: number, average: number },
        "333oh": { single: number, average: number },
        444: { single: number, average: number },
        555: { single: number, average: number },
        minx: { single: number, average: number },
        pyram: { single: number, average: number },
        skewb: { single: number, average: number },
      }
    }
  }

  const getSheetData = async(): Promise<wcaRekorder> => {
    setLoadingWCA(true);
    const response = await axios.get(`${process.env.REACT_APP_NORSKEREKORDERWCA_KEY}`);
    setSheetData(response.data.values);
    setLoadingWCA(false);
    return response.data;
  }

  const nationaleRekorder = async(): Promise<wcaRekorder> => {
    setLoadingOfficial(true);
    const response = await axios.get(`${process.env.REACT_APP_NORSKEREKORDER_KEY}`);
    setNorgesRekorderWCA(response.data.values);
    setLoadingOfficial(false);
    return response.data;
  }

  const nasjonaleRekorderNonWCA = async(): Promise<any> => {
    setLoadingNonWCA(true);
    const response = await axios.get(`${process.env.REACT_APP_NORSKEREKORDERNONWCA_KEY}`);
    setSheetData2(response.data.values);
    setLoadingNonWCA(false);
    return response.data;
  }

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
    getSheetData();
    nationaleRekorder();
    nasjonaleRekorderNonWCA();
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
      <NavBar/>
      <div className="Main RekorderBody">
        <div className="intro">
          <h1 className="MainHeader">Norske rekorder</h1>
          Her er en liste over rekordene i Norge og hvem som har de. 
          Vi har også oversikt over de uoffisielle rekordene som ikke er satt i konkurranse, 
          og noen eventer som WCA ikke holder styr på. 
        </div>
        <br></br>
        <div className="tab">
          <button className={tab1 ? "tabLinks Activated" : "tablinks"} onClick={() => toggleTabs('tab1')}>
            <h3>Offisielle Rekorder</h3>
          </button>
          <button className={tab2 ? "tabLinks Activated" : "tablinks"} onClick={() => toggleTabs('tab2')}>
            <h3>Uoffisielle Rekorder</h3>
          </button>
          <button className={tab3 ? "tabLinks Activated" : "tablinks"} onClick={() => toggleTabs('tab3')}>
            <h3>Ikke-WCA Rekorder</h3>
          </button>
        </div>
        <div className="recordTable">
          {loadingWCA ? 'loading' : displayTab()}
        </div>
      </div>
    </div>
  );
}

export default Rekorder;
