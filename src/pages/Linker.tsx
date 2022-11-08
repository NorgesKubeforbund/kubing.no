import React from 'react';
import { NavBar } from '../components/Header';
import './Linker.css';

function Linker(): React.ReactElement<any, any> {
    return (
        <div className="Eksterne Ressurser">
            <NavBar/>
            <div className='Main'>
                <div className='Intro'>
                    <h1 className='MainHeader'>Linker</h1>

                </div>
                <div className='ExtRessurs'>
                    <h2>WCA</h2>
                    <a href='https://www.worldcubeassociation.org/' target='_blank' rel='noopener'>WCA</a> sinne hjemmesider inneholder resultat og informasjon om alle offisielle konkurranser i hele verden.
                    Du kan også finne profilen til alle som har deltatt på konkurranser.
                </div>
                <div className='ExtRessurs'>
                    <h2>WCA Live</h2>
                    <a href='https://live.worldcubeassociation.org/' target='_blank' rel='noopener'>WCA Live</a> viser resultater fra pågående konkurranser.
                    Om du delatar på en konkurranse kan du bruke denne siden for å få oversik om du har gått videre eller ikke.
                </div>
                <div className='ExtRessurs'>
                    <h2>Norske Speedcubers på Facebook</h2>
                    <a href='https://www.facebook.com/groups/NorskeSpeedcubers' target='_blank' rel='noopener'>Norske Speedcubers</a> er den offisieller Facebook-siden for det norske kubemiljøet.
                    Her kan du få kontakt med resten av kubemiljøet.
                </div>
                <div className='ExtRessurs'>
                    <h2>NKF på YouTube</h2>
                    <a href='https://www.youtube.com/channel/UCfznV1sSz1o5FJAzmR87ijg' target='_blank' rel='noopener'>NKF</a> er også på YouTube. 
                    Her legges det stadig vekk ut videoer. 
                </div>

            </div>
        </div>


    );
}

export default Linker;