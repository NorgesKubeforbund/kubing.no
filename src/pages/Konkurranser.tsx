import React from 'react';
import { NavBar } from '../components/Header';
import './Konkurranser.css';
import axios from 'axios';
import {useEffect, useState} from 'react';

function Konkurranser() {

    const [loading, setLoading] = useState<boolean>(false);
    const [compData, setCompData] = useState<any>();

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


    const comps = (competitions: any) => {
            return(
                <div>{competitions.map((comp: any) => (
                    <h1>{comp.name}</h1>
                  ))}</div>  
            );
    }


    

    return (
        <div className="Konkurranser">
            <NavBar/>
            <div className="Comps">
            {loading && <p>Loading data...</p>}
            {comps(compData)}
            </div>
        </div>
    );
}

export default Konkurranser;