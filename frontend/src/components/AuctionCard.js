// src/components/AuctionCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuctionCard.css';

const AuctionCard = ({ item, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/bid', { state: { item } });
  };

  return (
    <>
      <div className="auction-card" onClick={handleCardClick}>
        <img src={item.image} alt={item.name} className="auction-card-image" />
        <h3>{item.name}</h3>
        <p className="auction-card-description">{item.description}</p>
        <p className="auction-card-sku">SKU: {item.sku}</p>
        <p>Status: {item.status}</p>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseModal}>
              &times;
            </span>
            <img src={item.image} alt={item.name} className="modal-image" />
            <h2>{item.name}</h2>
            <p className="modal-sku">SKU: {item.sku}</p>
            <p className="modal-description">{item.description}</p>
            <p className="modal-close-date">Auction Close Date: {item.closeDate}</p>
            <p className="modal-status">Status: {item.status}</p>
            <button className="cta-button" onClick={handleButtonClick}>
        View Full Details & Bid
      </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AuctionCard;
