// src/components/AuctionCard.js
import React from 'react';
import './AuctionCard.css'; // Import styles specific to the card

const AuctionCard = ({ item, onClick }) => {
  return (
    <div className="auction-card" onClick={() => onClick(item)}>
      <img src={item.image} alt={item.name} className="auction-card-image" />
      <h3>{item.name}</h3>
      <p className="auction-card-description">{item.description}</p>
      <p className="auction-card-sku">SKU: {item.sku}</p>
      <p>Starting Bid: ${item.startingBid}</p>
      <p>Status: {item.status}</p>
    </div>
  );
};

export default AuctionCard;
