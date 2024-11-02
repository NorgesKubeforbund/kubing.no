import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./pages/App";
import Konkurranser from "./pages/Konkurranser";
import Ressurser from "./pages/Ressurser";
import Butikker from "./pages/Ressurser/Butikker";
import Guider from "./pages/Ressurser/Guider";
import Lenker from "./pages/Ressurser/Lenker";
import LokaleArrangement from "./pages/Ressurser/LokaleArrangement";
import Rekorder from "./pages/Rekorder";
import OmOss from "./pages/OmOss";
import BliMedlem from "./pages/BliMedlem";
import Layout from "./components/Layout";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "Konkurranser",
        element: <Konkurranser />,
      },
      {
        path: "Ressurser",
        element: <Ressurser />,
      },
      {
        path: "Ressurser/Butikker",
        element: <Butikker />,
      },
      {
        path: "Ressurser/Guider",
        element: <Guider />,
      },
      {
        path: "Ressurser/Lenker",
        element: <Lenker />,
      },
      {
        path: "Ressurser/LokaleArrangement",
        element: <LokaleArrangement />,
      },
      {
        path: "Rekorder",
        element: <Rekorder />,
      },
      {
        path: "OmOss",
        element: <OmOss />,
      },
      {
        path: "BliMedlem",
        element: <BliMedlem />,
      },
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
