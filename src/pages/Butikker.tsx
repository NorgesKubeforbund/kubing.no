import React from 'react';
import './Butikker.css';
import {NavBar} from '../components/Header';

function Butikker() {
    return (
        <div className="Butikker">
            <NavBar/>            
            <div className='Main'>
                <div className='Intro'>
                    <h1>Butikker</h1>
                    Mange lurer på hvor de kan få tak i kuber.
                    <br></br>
                    Her er en liste med forskjellige reputable kubebutikker som vi har god erfaring med.
                </div>
                <div className='ButikkDiv'>
                    <h2><a href='https://cuboss.se/' target='_blank' className='HeaderLinks'>Cuboss</a></h2>
                    <p><a href='https://cuboss.se/' target='_blank'>Cuboss </a>
                        er en kubebutikk lokalisert i Sverige. De har et bra utvalg og kort leveringstid.
                    </p>
                </div>              
                <div className='ButikkDiv'>
                    <h2><a href='https://www.dailypuzzles.com.au/en-no' target='_blank' className='HeaderLinks'>Daily Puzzles</a></h2>
                    <p><a href='https://www.dailypuzzles.com.au/en-no' target='_blank'>Daily Puzzles </a>
                        er en kubebutikk lokalisert i Australia. De er en stor kubebutikk, men leveringstiden kan være lang siden kubene sendes fra australia.
                    </p>
                </div>
                <div className='ButikkDiv'>
                    <h2><a href='https://nordicube.com/' target='_blank' className='HeaderLinks'>Nordicube</a></h2>
                    <p><a href='https://nordicube.com/' target='_blank'>Nordicube </a>
                        er den eneste norske kubebutikken. Den har kort leveringstid og ingen importkostnader, men utvalget er nogenlude mangelfull.
                    </p>
                </div>
                <div className='ButikkDiv'>
                    <h2><a href='https://www.thecubicle.com/' target='_blank' className='HeaderLinks'>The Cubicle</a></h2>
                    <p><a href='https://www.thecubicle.com/' target='_blank'>The Cubicle </a> 
                        er en kubebutikk lokalisert i USA. Det har et stort utvalg, men også lengre leverinstid siden kubene sendes fra USA.
                    </p>
                </div>



            </div>
        </div>


    );
}

export default Butikker;