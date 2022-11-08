import React from 'react';
import { NavBar } from '../components/Header';
import './Rekorder.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Rekorder() {

    const [loading, setLoading] = useState<boolean>(false);
    const [sheetData, setSheetData] = useState<Array<Array<string>>>([]);

    const getSheetData = async() => {
        setLoading(true);
        const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1q9KIGan5FFJs67WMmtvj5rZWiBPPmdZp6s8zIodlqEw/values/EXPORT?key=AIzaSyACiTiM4Kz8HfzwUkjXJushOi1YBgcjmKw');
        setSheetData(response.data.values);
        setLoading(false);
        return response.data;


    }
    

    useEffect(() => {
        getSheetData();
    }, []);

    const unrWCATable = () => {
        return (
            <table>
                <tbody>
                    {sheetData.map((el: any) => (
                    
                    
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
    }

    const unrNonWCATable = () => {
        return (
            <table>
                <tbody>
                    {sheetData.map((el: any) => (
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