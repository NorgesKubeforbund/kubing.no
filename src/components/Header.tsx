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

  function dropDown() {
    var x = document.getElementById('NavBarFull') as HTMLElement;
    if(x.className === 'NavBar') {
      x.className += 'Responsive';

    } else {
      x.className = 'NavBar';
    }
  }


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
        
      </div>
        <div className="DropDown" onClick={() => {dropDown()}}>
          <div className="IconBar"></div>
          <div className="IconBar"></div>
          <div className="IconBar"></div>
        </div>
      
  </header>
  )
}