// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Add styles for the profile page

const ProfilePage = () => {
  // Example state for user and company data
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: {
      name: 'ACME Corp',
      listings: [
        { id: 1, name: 'Bulk Cereal', status: 'Active', bids: 10 },
        { id: 2, name: 'Soft Drinks', status: 'Closed', bids: 25 },
      ],
    },
    bids: [
      { id: 1, itemName: 'Bulk Coffee', currentBid: 500, status: 'Leading' },
      { id: 2, itemName: 'Organic Snacks', currentBid: 300, status: 'Outbid' },
    ],
  });

  useEffect(() => {
    // Fetch user and company data from API here if needed
  }, []);

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <section className="user-info">
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </section>

      <section className="company-info">
        <h3>Company: {user.company.name}</h3>
        <h4>Current Listings</h4>
        <ul className="listings">
          {user.company.listings.map((listing) => (
            <li key={listing.id} className="listing-item">
              <strong>{listing.name}</strong> - {listing.status} - Bids: {listing.bids}
            </li>
          ))}
        </ul>
      </section>

      <section className="user-bids">
        <h4>Your Current Bids</h4>
        <ul className="bids">
          {user.bids.map((bid) => (
            <li key={bid.id} className="bid-item">
              <strong>{bid.itemName}</strong> - Current Bid: ${bid.currentBid} - {bid.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ProfilePage;
