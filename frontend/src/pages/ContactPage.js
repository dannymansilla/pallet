// src/pages/ContactPage.js
import React from 'react';
import './ContactPage.css'; // Add the CSS file for styling

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h2>Contact Us</h2>
      <p>If you have any questions or need support, please reach out to us.</p>
      <form className="contact-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea name="message" required></textarea>
        </div>
        <button type="submit" className="contact-button">Send Message</button>
      </form>
    </div>
  );
};

export default ContactPage;
