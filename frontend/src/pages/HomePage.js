// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './HomePage.css'; // Optional: Add styles for your Home Page

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to Pallet Market</h1>
        <p>Your destination for live auctions and unbeatable deals!</p>
      </header>

      <section className="featured-auctions">
        <h2>Featured Auctions</h2>
        <p>Check out some of our most popular items currently up for bid:</p>
        <div className="auction-list">
          <div className="auction-item">Item 1 - Starting at $50</div>
          <div className="auction-item">Item 2 - Starting at $100</div>
          <div className="auction-item">Item 3 - Starting at $200</div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <p>
          Sign up, browse auctions, place your bids, and win exciting products at amazing prices. Our marketplace makes
          it easy to participate in live auctions from the comfort of your home.
        </p>
      </section>

      <section className="cta-section">
        <Link to="/auctions">
          <button className="cta-button">Browse All Auctions</button>
        </Link>
        <Link to="/create-account"> 
          <button className="cta-button">Create an Account</button>
        </Link>
        <Link to="/login">
          <button className="cta-button">Log In</button> 
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
