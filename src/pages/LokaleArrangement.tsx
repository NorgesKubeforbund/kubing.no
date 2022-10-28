import React from 'react';
import { NavBar } from '../components/Header';
import './LokaleArrangement.css';

function LokaleArrangement() {
    return (
        <div className="LokaleArrangement">
            <NavBar/>
            <div className='Main'>
                <div className='Intro'>
                    <h1 className='MainHeader'> Lokale Arrangement</h1>
                    Ønsker du å finne andre kubere å løse sammen med? 
                    Det finnes flere lokale arragement rundt omkring i landet som møtes gjevnlig for å kube sammen.
                    Mange av de størtse byene har tilbud, men du kan også spørre 
                    på facebook-siden <a href='https://www.facebook.com/groups/NorskeSpeedcubers' target='_blank' rel='noopener'>Norske SpeedCubers</a> om det er noen kubere i nærheten av deg.
                    Kanskje du kan bidra til å skape et tilbud for ditt lokalmiljø?
                </div>
                
                <div className='LokaltArrangement'>
                    <h2>Oslo-viken</h2>
                    <a href='https://www.facebook.com/groups/529099402302831/' target='_blank' rel='noopener'>Cube Drammen</a> har tilbud i Drammen.<br></br>
                    <a href='https://www.facebook.com/groups/2430272227122282/' target='_blank' rel='noopener'>Kubing i Bærum</a> har tilbud i Bærum.<br></br>
                    <a href='https://spond.com/landing/group/TSRZF' target='_blank'>Romerike SpeedCubers</a> har tilbud i Lillestrøm.
                </div>
                <div className='LokaltArrangement'>
                    <h2>Rogaland</h2>
                    <a href='https://www.facebook.com/groups/1658988921015490' target='_blank' rel='noopener'>Sandnes SpeedCubers</a> har tilbud i sannes.
                </div>
                <div className='LokaltArrangement'>
                    <h2>Trøndelag</h2>
                    I trondheim er det to forskjellige tilbud:<br></br>
                    
                    <a href='https://www.facebook.com/groups/1345849928919723' target='_blank' rel='noopener'>Flatåsen Kubeklubb</a> har tilbud.<br></br>
                    <a href='https://www.facebook.com/NTNUISpeedcubing' target='_blank' rel='noopener'>NTNUI Speedcubing</a> har tilbud.
                </div>



            </div>
        </div>


    );
}

export default LokaleArrangement;