import React from 'react';
import './Header.css';
import { pagePaths } from '../types';
import image from '../media/NKF_Logo_trans.png';

export const NavBar = (): React.ReactElement<any, any> => {
  
  const pages: pagePaths = [
    {name: 'Hjem', path: '/'}, 
    {name: 'Konkurranser', path: '/Konkurranser'}, 
    {name: 'Butikker', path: '/Butikker'}, 
    {name: 'Guider', path: '/Guider'}, 
    {name: 'Linker', path: '/Linker'},
    {name: 'Norske Rekorder', path: '/Rekorder'}, 
    {name: 'Lokale Arrangement', path: '/LokaleArrangement'},
    {name: 'Om Oss', path: '/OmOss'}, 
  ];

  const dropDown = (): void => {
    const x = document.getElementById('NavBarFull') as HTMLElement;
    if(x.className === 'NavBar') {
      x.className += 'Responsive';
    } else {
      x.className = 'NavBar';
    }
  };

  return (
    <header className="App-header">
      <div>
        <img src={image} className="Logo" alt="logo" />
      </div>
      <a className="LogoName">Norges Kubeforbund</a>
      <div className="NavBar" id="NavBarFull">
        {pages.map((pg) => {
          if (pg['path'] == window.location.pathname) {
            return (
              <button key={pg['name']} id={pg['name']} onClick={() => {
                window.location.href = pg['path']
              }} className="MenuLinks active">{pg['name']}</button>
            );
          } else {
            return (
              <button key={pg['name']} id={pg['name']} onClick={() => {
                window.location.href = pg['path']
              }} className="MenuLinks">{pg['name']}</button>
            );
          }
        })} 
      </div>
        <div className="DropDown" onClick={() => {dropDown()}}>
          <div className="IconBar"></div>
          <div className="IconBar"></div>
          <div className="IconBar"></div>
        </div>
    </header>
  )
}
