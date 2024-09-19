// src/pages/LoginPage.js
import React, { useState } from 'react';
import './LoginPage.css'; // Add styles for the login page

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic, e.g., API call to log in
    console.log('Logging in with:', formData);
  };

  return (
    <div className="login-page">
      <h2>Log In</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="cta-button">
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
