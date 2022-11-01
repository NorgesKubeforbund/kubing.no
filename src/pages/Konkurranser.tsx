import React from 'react';
import { NavBar } from '../components/Header';
import './Konkurranser.css';
import axios from 'axios';
import {useEffect, useState} from 'react';

function Konkurranser() {

    const [loading, setLoading] = useState<boolean>(false);
    const [compData, setCompData] = useState<any>([]);

    const getCompData = async() => {
        setLoading(true);
        const response = await axios.get('https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=NO&limit=30');
        setCompData(response.data);
        setLoading(false);
        return await response.data;
    }

    useEffect(() => {
        getCompData();
    }, []);

    console.log(compData);



    


    const comps = () => {
            return(
                <table className="compTable">
                    <thead>
                        <th>Navn</th>
                        <th>By</th>
                        <th>Dato</th>
                    </thead>
                    <tbody className="comp">{compData.map((comp: any) => (                                                                  
                        <tr className="compRow">
                            <td className="compName"><a href={comp.url} className="compLinks">{comp.name}</a></td>
                            <td className="compCity">{comp.city}</td>
                            <td className="compDate">{comp.start_date}</td>
                        </tr>

                    ))}
                    </tbody>  
                  </table>
            );
    }


    

    return (
        <div className="Konkurranser">
            <NavBar/>
            <div className="Main">
            
                <div className="arrangere">
                    <p>Ønsker du å arrangere en konkurranse?</p>
                </div>

                <h1 className='MainHeader'>Kommende Konkurranser</h1>
                <div className="Comps">
                {loading && <p>Loading data...</p>}
                {comps()}
                </div>
                <br></br>
                <br></br>
            </div>
        </div>
    );
}

export default Konkurranser;