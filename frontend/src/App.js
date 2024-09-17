// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage'; 
import AuctionsPage from './pages/AuctionsPage'; 
import AboutPage from './pages/AboutPage'; 
import ContactPage from './pages/ContactPage';
import CreateAccountPage from './pages/CreateAccountPage'; 
import LoginPage from './pages/LoginPage'; 
import ProfilePage from './pages/ProfilePage';
import ListProductPage from './pages/ListProductPage';
import BiddingPage from './pages/BiddingPage'; 

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} /> 
            <Route path="/list-product" element={<ListProductPage />} />
            <Route path="/bid" element={<BiddingPage />} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
