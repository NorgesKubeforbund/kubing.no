import React from 'react';
import { NavBar } from '../components/Header';
import './Rekorder.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Rekorder(): React.ReactElement<any, any> {

  const [loading, setLoading] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [norgesRekorder, setNorgesRekorder] = useState<wcaRekorder[]>([]);

  type wcaRekorder = {
    national_records: {
      Norway: { 
        222: { single: number, average: number },
        333: { single: number, average: number },
        "333oh": { single: number, average: number },
        444: { single: number, average: number },
        555: { single: number, average: number },
        minx: { single: number },
        pyram: { single: number, average: number },
        skewb: { single: number, average: number }
      }
    }
  }

  const getSheetData = async(): Promise<wcaRekorder> => {
    setLoading(true);
    const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1q9KIGan5FFJs67WMmtvj5rZWiBPPmdZp6s8zIodlqEw/values/EXPORT  key=AIzaSyACiTiM4Kz8HfzwUkjXJushOi1YBgcjmKw');
    setSheetData(response.data.values);
    setLoading(false);
    return await response.data;
  }

  const nationaleRekorder = async(): Promise<wcaRekorder> => {
    const response = await axios.get('https://www.worldcubeassociation.org/api/v0/records');
    setNorgesRekorder(response.data.national_records.Norway);
    console.log(norgesRekorder);
    return await response.data;
  }

  useEffect(() => {
    getSheetData();
    nationaleRekorder();
  }, []);

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
          {sheetData.map((el: string[]) => (
          <tr key={el[0]} className="recordRow">
            <td className="Cell"><b>{el[6]}</b></td>    
            <td>{el[7]}</td>  
            <td>{el[8]}</td> 
            <td>{el[9]}</td>  
            <td>{el[10]}</td>                            
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
        {loading && <p>Loading data...</p>}  
        <div className='UnrWCA'>{unrWCATable()}</div> 
        {loading && <p>Loading data...</p>}  
        <div className='UnrNonWCA'>{unrNonWCATable()}</div>
      </div>
    </div>
  );
}

export default Rekorder;