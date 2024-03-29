import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import Butikker from './pages/Butikker';
import Guider from './pages/Guider';
import Konkurranser from './pages/Konkurranser';
import OmOss from './pages/OmOss';
import Rekorder from './pages/Rekorder';
import Lenker from './pages/Lenker';
import LokaleArrangement from './pages/LokaleArrangement';
import Layout from './components/Layout';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "Butikker",
        element: <Butikker />,
      },
      {
        path: "Guider",
        element: <Guider />,
      },
      {
        path: "Konkurranser",
        element: <Konkurranser />,
      },
      {
        path: "OmOss",
        element: <OmOss />,
      },
      {
        path: "Rekorder",
        element: <Rekorder />,
      },
      {
        path: "Lenker",
        element: <Lenker />,
      },
      {
        path: "LokaleArrangement",
        element: <LokaleArrangement />,
      },
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
