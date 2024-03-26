import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './Header';
import Footer from './Footer';
import './Layout.css';


const Layout: React.FC = () => {
  return (
    <div className="pageLayout">
        <div className="page">
      <NavBar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;