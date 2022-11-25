import React from 'react';
import { NavBar } from '../components/Header';
import './Rekorder.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Rekorder(): React.ReactElement<any, any> {

  const [loadingWCA, setLoadingWCA] = useState<boolean>(false);
  const [loadingNonWCA, setLoadingNonWCA] = useState<boolean>(false);
  const [loadingOfficial, setLoadingOfficial] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [sheetData2, setSheetData2] = useState<string[][]>([]);
  const [norgesRekorder, setNorgesRekorderWCA] = useState<string[][]>([]);
  

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
        skewb: { single: number, average: number }
      }
    }
  }

  const getSheetData = async(): Promise<wcaRekorder> => {
    setLoadingWCA(true);
    const response = await axios.get(`${process.env.REACT_APP_NORSKEREKORDERWCA_KEY}`);
    setSheetData(response.data.values);
    setLoadingWCA(false);
    return await response.data;
  }

  const nationaleRekorder = async(): Promise<wcaRekorder> => {
    setLoadingOfficial(true);
    const response = await axios.get(`${process.env.REACT_APP_NORSKEREKORDER_KEY}`);
    setNorgesRekorderWCA(response.data.values);
    setLoadingOfficial(false);
    return await response.data;
  }

  const nasjonaleRekorderNonWCA = async(): Promise<any> => {
    setLoadingNonWCA(true);
    const response = await axios.get(`${process.env.REACT_APP_NORSKEREKORDERNONWCA_KEY}`);
    setSheetData2(response.data.values);
    setLoadingNonWCA(false);
    return await response.data;
  }



  useEffect(() => {
    getSheetData();
    nationaleRekorder();
    nasjonaleRekorderNonWCA();
  }, []);

  const WCATable = (): React.ReactElement<any, any> => {
    return (
      <table>
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
      <table>
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
      <table>
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

  //render
  return (
    <div className="Rekorder">
      <NavBar/>
      <div className="tables">
        {loadingWCA && <p>Loading data...</p>}  
        <div className='UnrWCA'>{unrWCATable()}</div> 
        {loadingNonWCA && <p>Loading data...</p>}
        <div className='UnrNonWCA'>{unrNonWCATable()}</div>
        {loadingOfficial && <p>Loading data...</p>}
        <div className='WCA'>{WCATable()}</div>

      </div>
    </div>
  );
}

export default Rekorder;