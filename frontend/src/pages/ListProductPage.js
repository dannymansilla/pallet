// src/pages/ListProductPage.js
import React, { useState } from 'react';
import './ListProductPage.css'; // Optional: Add styles for the page

const ListProductPage = () => {
  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    quantity: '',
    startingBid: '',
    auctionEndDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic, e.g., API call
    console.log('Product listed:', productData);
  };

  return (
    <div className="list-product-page">
      <h2>List New Product</h2>
      <form className="list-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="productName"
            value={productData.productName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={productData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Starting Bid</label>
          <input
            type="number"
            name="startingBid"
            value={productData.startingBid}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Auction End Date</label>
          <input
            type="datetime-local"
            name="auctionEndDate"
            value={productData.auctionEndDate}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="list-product-button">
          List Product
        </button>
      </form>
    </div>
  );
};

export default ListProductPage;
