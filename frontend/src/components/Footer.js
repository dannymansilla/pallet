// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Optional: Add styles for your footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© 2024 Pallet Market Inc. All rights reserved.</p>
        <nav className="footer-nav">
          <ul className="footer-list">
            <li className="footer-item">
              <a href="/privacy" className="footer-link">
                Privacy Policy
              </a>
            </li>
            <li className="footer-item">
              <a href="/terms" className="footer-link">
                Terms of Service
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
