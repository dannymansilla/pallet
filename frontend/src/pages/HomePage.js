// src/pages/HomePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard'; // Import the reusable AuctionCard component
import './HomePage.css';

const HomePage = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([
    {
      id: 1,
      name: 'Bulk Cereal',
      startingBid: 50,
      status: 'Active',
      description: 'High-quality bulk cereal perfect for large-scale distribution.',
      sku: 'CER-123456',
      image: 'https://via.placeholder.com/150', // Placeholder image URL
    },
    {
      id: 2,
      name: 'Soft Drinks',
      startingBid: 100,
      status: 'Active',
      description: 'Assorted soft drinks in bulk for retail or events.',
      sku: 'DRK-654321',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Organic Snacks',
      startingBid: 200,
      status: 'Closed',
      description: 'A variety of organic snacks, perfect for healthy eating.',
      sku: 'SNK-789012',
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const handleCardClick = (item) => {
    alert(`More information about: ${item.name}`);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to Pallet Marketplace</h1>
        <p>Your destination for live auctions and unbeatable deals!</p>
      </header>

      <section className="featured-auctions">
        <h2>Featured Auctions</h2>
        <p>Check out some of our most popular items currently up for bid:</p>
        <div className="auction-list">
          {featuredAuctions.map((item) => (
            <AuctionCard key={item.id} item={item} onClick={handleCardClick} />
          ))}
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
