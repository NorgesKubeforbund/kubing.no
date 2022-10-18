import './Header.css';
import image from '../media/NKF_Logo_trans.png';

export const NavBar = () => {

  const pages = [
    {name: 'Hjem', path: '/'}, 
    {name: 'Konkurranser', path: '/Konkurranser'}, 
    {name: 'Butikker', path: '/Butikker'}, 
    {name: 'Guider', path: '/Guider'}, 
    {name: 'Om Oss', path: '/OmOss'}, 
    {name: 'Norske Rekorder', path: '/Rekorder'}, 
    {name: 'Eksterne Ressurser', path: '/EksterneRessurser'}, 
    {name: 'Lokale Arrangement', path: '/LokaleArrangement'},
  ]

  return (
  <header className="App-header">
    <div>
    <img src={image} className="Logo" alt="logo" />
    
    </div>
    <a>Norges Kubeforbund</a>
      <div className="NavBar">
        {pages.map((pg) => {
          if (pg['path'] == window.location.pathname) {
            return (
              <button key={pg['name']} onClick={() => {
                window.location.href = pg['path']
              }} className="MenuLinks active">{pg['name']}</button>
            )
          } else {
            return (
              <button onClick={() => {
                window.location.href = pg['path']
              }} className="MenuLinks">{pg['name']}</button>
            )
          }
        })}
        <div className="DropDown">
          <div className="IconBar"></div>
          <div className="IconBar"></div>
          <div className="IconBar"></div>
        </div>
      </div>
  </header>
  )
}