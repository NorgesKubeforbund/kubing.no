import React from 'react';
import { NavBar } from '../components/Header';
import './Guider.css';

function Guider(): React.ReactElement<any, any> {
    return (
        <div className="Guider">
            <NavBar/>
            <p>tekst her om guidene til nettsiden</p>
        </div>


    );
}

export default Guider;