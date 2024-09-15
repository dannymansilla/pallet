// src/pages/AuctionsPage.js
import React from 'react';
import './AuctionsPage.css'; // Add the CSS file for styling

const AuctionsPage = () => {
  return (
    <div className="auctions-page">
      <h2>Auctions</h2>
      <p>Explore our live auctions and place your bids on bulk quantities of consumer packaged goods.</p>
      <div className="auctions-list">
        {/* Placeholder auction items */}
        <div className="auction-item">
          <h3>Item 1</h3>
          <p>Starting Bid: $50</p>
          <button className="bid-button">Place Bid</button>
        </div>
        <div className="auction-item">
          <h3>Item 2</h3>
          <p>Starting Bid: $100</p>
          <button className="bid-button">Place Bid</button>
        </div>
        <div className="auction-item">
          <h3>Item 3</h3>
          <p>Starting Bid: $200</p>
          <button className="bid-button">Place Bid</button>
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;
