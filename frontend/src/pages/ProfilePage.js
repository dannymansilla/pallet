// src/pages/ProfilePage.js
import React, { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  // Sample user and company data
  const user = {
    name: 'John Doe',
    company: {
      name: 'ABC Foods Inc.',
      location: 'New York, NY',
      industry: 'Food Distribution',
    },
  };

  // Sample listings and current bids data
  const [listings, setListings] = useState([
    {
      id: 1,
      name: 'Bulk Cereal',
      description: 'High-quality bulk cereal perfect for large-scale distribution.',
      sku: 'CER-123456',
      closeDate: '2024-09-30',
      status: 'Active',
      bids: [
        { company: 'ABC Foods', price: 75, quantity: 100, location: 'New York, NY' },
        { company: 'Global Grocers', price: 70, quantity: 150, location: 'Chicago, IL' },
        { company: 'Healthy Eats', price: 65, quantity: 200, location: 'Los Angeles, CA' },
      ],
    },
    {
      id: 2,
      name: 'Soft Drinks',
      description: 'Assorted soft drinks in bulk for retail or events.',
      sku: 'DRK-654321',
      closeDate: '2024-10-05',
      status: 'Active',
      bids: [
        { company: 'Beverage World', price: 85, quantity: 50, location: 'Miami, FL' },
        { company: 'Drink Distributors', price: 80, quantity: 80, location: 'Houston, TX' },
      ],
    },
  ]);

  // Sample current bids by the user
  const [userBids, setUserBids] = useState([
    {
      id: 1,
      itemName: 'Bulk Cereal',
      bidPrice: 70,
      bidQuantity: 120,
      description: 'High-quality bulk cereal perfect for large-scale distribution.',
      sku: 'CER-123456',
      closeDate: '2024-09-30',
      status: 'Active',
    },
    {
      id: 2,
      itemName: 'Soft Drinks',
      bidPrice: 82,
      bidQuantity: 60,
      description: 'Assorted soft drinks in bulk for retail or events.',
      sku: 'DRK-654321',
      closeDate: '2024-10-05',
      status: 'Active',
    },
  ]);

  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
  };

  const handleBidClick = (bid) => {
    setSelectedBid(bid);
  };

  const handleCloseCard = () => {
    setSelectedListing(null);
    setSelectedBid(null);
  };

  return (
    <div className="profile-page">
      {/* User and Company Info */}
      <div className="user-info">
        <h2>{user.name}</h2>
        <p><strong>Company:</strong> {user.company.name}</p>
        <p><strong>Location:</strong> {user.company.location}</p>
        <p><strong>Industry:</strong> {user.company.industry}</p>
      </div>

      {/* Listings Section */}
      <h3>Listings</h3>
      <ul className="listings">
        {listings.map((listing) => (
          <li key={listing.id} className="listing-item" onClick={() => handleListingClick(listing)}>
            {listing.name} (SKU: {listing.sku})
          </li>
        ))}
      </ul>

      {/* Listing Details Card */}
      {selectedListing && (
        <div className="listing-card">
          <span className="close-button" onClick={handleCloseCard}>&times;</span>
          <h3>{selectedListing.name}</h3>
          <p><strong>Description:</strong> {selectedListing.description}</p>
          <p><strong>SKU:</strong> {selectedListing.sku}</p>
          <p><strong>Auction Close Date:</strong> {selectedListing.closeDate}</p>
          <p><strong>Status:</strong> {selectedListing.status}</p>

          <h4>Current Bids</h4>
          <table className="bids-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {selectedListing.bids
                .sort((a, b) => b.price - a.price) // Sort bids from highest to lowest price
                .map((bid, index) => (
                  <tr key={index}>
                    <td>{bid.company}</td>
                    <td>${bid.price}</td>
                    <td>{bid.quantity}</td>
                    <td>{bid.location}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Current Bids Section */}
      <h3>Bids</h3>
      <ul className="bids-list">
        {userBids.map((bid) => (
          <li key={bid.id} className="bid-item" onClick={() => handleBidClick(bid)}>
            {bid.itemName} (SKU: {bid.sku})
          </li>
        ))}
      </ul>

      {/* Bid Details Card */}
      {selectedBid && (
        <div className="bid-card">
          <span className="close-button" onClick={handleCloseCard}>&times;</span>
          <h3>{selectedBid.itemName}</h3>
          <p><strong>Description:</strong> {selectedBid.description}</p>
          <p><strong>SKU:</strong> {selectedBid.sku}</p>
          <p><strong>Auction Close Date:</strong> {selectedBid.closeDate}</p>
          <p><strong>Status:</strong> {selectedBid.status}</p>
          <p><strong>Your Bid Price:</strong> ${selectedBid.bidPrice}</p>
          <p><strong>Your Bid Quantity:</strong> {selectedBid.bidQuantity}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
