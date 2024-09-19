// src/pages/AuctionsPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard'; // Import the reusable AuctionCard component
import './AuctionsPage.css';

const AuctionsPage = () => {
  const [auctionItems, setAuctionItems] = useState([
    {
      id: 1,
      name: 'Bulk Cereal',
      startingBid: 50,
      status: 'Active',
      closeDate: '2024-09-30',
      description: 'High-quality bulk cereal perfect for large-scale distribution.',
      sku: 'CER-123456',
      image: 'https://via.placeholder.com/150', // Placeholder image URL
    },
    {
      id: 2,
      name: 'Soft Drinks',
      startingBid: 100,
      status: 'Active',
      closeDate: '2024-09-30',
      description: 'Assorted soft drinks in bulk for retail or events.',
      sku: 'DRK-654321',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Organic Snacks',
      startingBid: 200,
      status: 'Closed',
      closeDate: '2024-09-30',
      description: 'A variety of organic snacks, perfect for healthy eating.',
      sku: 'SNK-789012',
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const handleCardClick = (item) => {
    alert(`More information about: ${item.name}`);
  };

  return (
    <div className="auctions-page">
      <h2>Auctions</h2>
      <p>Explore our live auctions and place your bids on bulk quantities of consumer packaged goods.</p>

      <Link to="/list-product" className="list-item-button">
        <button className="cta-button">List New Item</button>
      </Link>

      <div className="auctions-list">
        {auctionItems.map((item) => (
          <AuctionCard key={item.id} item={item} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
};

export default AuctionsPage;
