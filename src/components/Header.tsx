import './Header.css';
import image from '../media/NKF_Logo_trans.png';

export const NavBar = () => {
  return (
  <header className="App-header">
    <div>
    <img src={image} className="Logo" alt="logo" />
    
    </div>
    <a>Norges Kubeforbund</a>
      <div className="NavBar">
        <button onClick={() => {
          window.location.href = "./"
          }} className="MenuLinks active">Hjem</button>
        <button onClick={() => {
          window.location.href = "./Konkurranser"
          }} className="MenuLinks">Konkurranser</button>
        <button onClick={() => {
          window.location.href = "./Butikker"
          }} className="MenuLinks">Butikker</button>       
          <button onClick={() => {
          window.location.href = "./Guider"
          }} className="MenuLinks">Guider</button>                       
          <button onClick={() => {
          window.location.href = "./OmOss"
          }} className="MenuLinks">Om oss</button>         
          <button onClick={() => {
          window.location.href = "./Rekorder"
          }} className="MenuLinks">Norske rekorder</button>
          <button onClick={() => {
          window.location.href = "./EksterneRessurser"
          }} className="MenuLinks">Eksterne ressurser</button>
          <button onClick={() => {
          window.location.href = "./LokaleArrangement"
          }} className="MenuLinks">Lokale arrangement</button>
        <div className="DropDown">
          <div className="IconBar"></div>
          <div className="IconBar"></div>
          <div className="IconBar"></div>
        </div>
      </div>
  </header>
  )
}