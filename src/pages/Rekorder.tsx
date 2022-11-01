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
        const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1q9KIGan5FFJs67WMmtvj5rZWiBPPmdZp6s8zIodlqEw/values/UNR%20WCA?key=AIzaSyACiTiM4Kz8HfzwUkjXJushOi1YBgcjmKw');
        setSheetData(response.data.values);
        setLoading(false);
        return await response.data;


    }
    

    useEffect(() => {
        getSheetData();
    }, []);

    const unrTable = () => {
        return (
            <table>
                <thead>
                    <tr>
                        <td>navn</td>
                        <td>tid</td>
                        <td>event</td>
                        <td>tid</td>
                        <td>navn</td>
                        
                    </tr>
                </thead>
                <tbody>
                    {sheetData.map((el: any) => (
                    <tr key={el[0]}>
                        <td>{el[2]}</td>
                        <td>{el[1]}</td>
                        <td>{el[0]}</td>                        
                        <td>{el[5]}</td>
                        <td>{el[6]}</td>                          
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
                <div>{unrTable()}</div>           
            </div>
        </div>


    );
}

export default Rekorder;