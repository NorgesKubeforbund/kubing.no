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
        return response.data;
    }

    useEffect(() => {
        getCompData();
    }, []);
    const commingComps = () => {
            return(
                <table className="compTable">
                    <thead>
                        <tr>
                            <th>Navn</th>
                            <th>Sted</th>
                            <th>Dato</th>
                        </tr>
                    </thead>
                    <tbody className="comp">{compData.map((comp: any) => {
                        
                        let compDate;
                        let compElStart = new Date(comp.start_date);
                        let compElEnd = new Date(comp.end_date);


                        if (Date.parse(comp.start_date) === Date.parse(comp.end_date)){
                            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'});
                        }
                        else { 
                            compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'}) + " - "  + 
                            compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", {month: 'short'});
                        }

                        
                        if(Date.parse(comp.end_date) > Date.now()){
                            return(                                  
                                <tr className="compRow" key={comp.id}>
                                    <td className="compName"><a href={comp.url} className="compLinks">{comp.name}</a></td>
                                    <td className="compCity">{comp.city}</td>
                                    <td className="compDate">{compDate}</td>
                                </tr>
        
                            )
                        }
                        })}
                    </tbody>  
                  </table>
            );
    }

    const pastComps = () => {
        return(
            <table className="compTable">
                <thead>
                    <tr>
                        <th>Navn</th>
                        <th>Sted</th>
                        <th>Dato</th>
                    </tr>
                </thead>
                <tbody className="comp">{compData.map((comp: any) => {
                    
                    let compDate;

                    let compElStart = new Date(comp.start_date);
                    let compElEnd = new Date(comp.end_date);

                    

                    if (Date.parse(comp.start_date) === Date.parse(comp.end_date)){
                        compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'});
                    }
                    else { 
                        compDate = compElStart.getDate() + " " + compElStart.toLocaleDateString("en-GB", {month: 'short'}) + " - "  + 
                        compElEnd.getDate() + " " + compElEnd.toLocaleDateString("en-GB", {month: 'short'});
                    }

                    if(Date.parse(comp.end_date) < Date.now()){
                        return(                                  
                            <tr className="compRow" key={comp.id}>
                                <td className="compName"><a href={comp.url} className="compLinks">{comp.name}</a></td>
                                <td className="compCity">{comp.city}</td>
                                <td className="compDate">{compDate}</td>
                            </tr>
    
                        )
                    }
                    })}
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
                {commingComps()}
                </div>

                <h1 className='MainHeader'>Tidligere Konkurranser</h1>
                <div className="Comps">
                {loading && <p>Loading data...</p>}
                {pastComps()}
                </div>
                <br></br>
                <br></br>
            </div>
        </div>
    );
}

export default Konkurranser;