// src/pages/BiddingPage.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './BiddingPage.css'; // Add a CSS file for styling

const BiddingPage = () => {
  // Use useLocation to access item data passed through the link
  const location = useLocation();
  const item = location.state?.item;

  // Form state
  const [bidPrice, setBidPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Bid submitted for ${item.name}! Price: $${bidPrice}, Quantity: ${quantity}, Delivery Address: ${deliveryAddress}`);
    // Handle the submission logic here (e.g., API call to submit the bid)
  };

  return (
    <div className="bidding-page">
      <h2>Bid on {item.name}</h2>
      <img src={item.image} alt={item.name} className="bidding-page-image" />
      <p><strong>Description:</strong> {item.description}</p>
      <p><strong>SKU:</strong> {item.sku}</p>
      <p><strong>Auction Close Date:</strong> {item.closeDate}</p>
      <p><strong>Status:</strong> {item.status}</p>

      <form onSubmit={handleSubmit} className="bid-form">
        <div className="form-group">
          <label>Bid Price per Unit:</label>
          <input
            type="number"
            value={bidPrice}
            onChange={(e) => setBidPrice(e.target.value)}
            required
            placeholder="Enter bid price per unit"
          />
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Enter quantity"
          />
        </div>

        <div className="form-group">
          <label>Delivery Address:</label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
            placeholder="Enter delivery address"
          />
        </div>

        <button type="submit" className="cta-button">Submit Bid</button>
      </form>
    </div>
  );
};

export default BiddingPage;
