import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import Butikker from './pages/Butikker';
import Guider from './pages/Guider';
import Konkurranser from './pages/Konkurranser';
import OmOss from './pages/OmOss';
import Rekorder from './pages/Rekorder';
import EksterneRessurser from './pages/Linker';
import LokaleArrangement from './pages/LokaleArrangement';



import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "Butikker",
    element: <Butikker/>,
  },
  {
    path: "Guider",
    element: <Guider/>,
  },
  {
    path: "Konkurranser",
    element: <Konkurranser/>,
  },
  {
    path: "OmOss",
    element: <OmOss/>,
  },
  {
    path: "Rekorder",
    element: <Rekorder/>,
  },
  {
    path: "EksterneRessurser",
    element: <EksterneRessurser/>,
  },
  {
    path: "LokaleArrangement",
    element: <LokaleArrangement/>,
  },



]);



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
