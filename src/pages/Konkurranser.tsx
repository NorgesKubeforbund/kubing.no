import React, { useEffect, useState, ComponentType } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { NavBar } from '../components/Header';
import { compResponse} from '../types';
import './Konkurranser.css';

function Konkurranser() {
  const [loading, setLoading] = useState<boolean>(false);
  const [compData, setCompData] = useState<compResponse[]>([]);
  const [arrData, setArrData] = useState<string[][]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const getCompData = async(): Promise<void> => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_KONKURRANSE_KEY}`)
        .then(response => setCompData(response.data));
      await axios.get(`${process.env.REACT_APP_ARRANGEREKONKURRASER_KEY}`)
        .then(response => setArrData(response.data.values));
      
    } catch (error) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      alert(message);
    }
    setLoading(false);
  }

  useEffect(() => {
    getCompData();
  }, []);

  const displayModal = () => {
    return (
      <Modal
        isOpen={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
        className="modalContainer"
        ariaHideApp={false}
      >
        <button
          className="modalCloseButton"
          onClick={() => setModalVisible(!modalVisible)}>
        Lukk vindu
        </button>
        <div className='modalContent'>
          {arrData.map((el: string[]) => {
            return (
              <div key={el[2]+'Div'}>
                <p key={el[2]+'Text'}>{el[0]}</p>
                {
                  el[1] === "" ? <p>{el[2]}</p> : <a key={el[2]+'Link'} href={el[1]}>{el[2]}</a>
                }
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }

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
  
  //render
  return (
    <div className="Konkurranser">
      <NavBar/>
      <div className="Main">
        <div className="arrangere">
          <button
            className="modalOpenButton"
            onClick={() => setModalVisible(!modalVisible)}>
            Ønsker du å arrangere en konkurranse? Klikk her!
          </button>
          {modalVisible}
          {displayModal()}
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
      </div>
    </div>
  );
}

export default Konkurranser;
