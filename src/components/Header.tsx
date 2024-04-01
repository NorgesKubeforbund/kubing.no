import React from 'react';
import './Header.css';
import { NavLink } from 'react-router-dom';
import { pagePaths } from '../types';
import image from '../media/NKF_Logo_trans.png';

export const NavBar = (): React.ReactElement<any, any> => {

  const pages: pagePaths = [
    { name: 'Hjem', path: '/' },
    { name: 'Konkurranser', path: '/Konkurranser' },
    { name: 'Ressurser', path: '/Ressurser' },
    { name: 'Norske Rekorder', path: '/Rekorder' },
    { name: 'Bli Medlem', path: '/BliMedlem' },
    { name: 'Om Oss', path: '/OmOss' },
  ];

  const dropDown = (): void => {
    const x = document.getElementById('NavBarFull') as HTMLElement;
    if (x.className === 'NavBar') {
      x.className += 'Responsive';
    } else {
      x.className = 'NavBar';
    }
  };


  return (
    <header className="App-header">
      <div onClick={() => window.location.href = "/"} className="clickableLogo">
        <img src={image} className="Logo" alt="logo" />
      </div>
      <a className="LogoName">Norges Kubeforbund</a>
      <div className="NavBar" id="NavBarFull">
        {pages.map((pg) => (
          <NavLink
            key={pg['name']}
            to={pg['path']}
            className={({ isActive }) => isActive ? "MenuLinks active" : "MenuLinks"}
            end={pg['path'] === '/'}
          >
            {pg['name']}
          </NavLink>
        ))}
      </div>
      <div className="DropDown" onClick={() => { dropDown() }}>
        <div className="IconBar"></div>
        <div className="IconBar"></div>
        <div className="IconBar"></div>
      </div>
    </header>
  )
}
