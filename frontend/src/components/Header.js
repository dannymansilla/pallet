import React from 'react';
import './Header.css';
import logo from '../pallet_logo.png'; // Make sure to update this path to the actual location of your logo

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="logo">
          <img src={logo} alt="Pallet Market Logo" className="logo-image" />
          <span className="site-name">Pallet Market</span>
        </a>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item"><a href="/" className="nav-link">Home</a></li>
            <li className="nav-item"><a href="/auctions" className="nav-link">Auctions</a></li>
            <li className="nav-item"><a href="/about" className="nav-link">About</a></li>
            <li className="nav-item"><a href="/contact" className="nav-link">Contact</a></li>
            <li className="nav-item profile-link"><a href="/profile" className="nav-link"><i className="fa fa-user"></i> Profile</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
