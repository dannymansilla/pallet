// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme'; // Ensure you have your custom theme file
import Header from './components/Header'; // Import the updated Header component
import Footer from './components/Footer'; // Import the updated Footer component
import HomePage from './pages/HomePage'; // Import your page components
import AuctionsPage from './pages/AuctionsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import ListProductPage from './pages/ListProductPage';
import BiddingPage from './pages/BiddingPage'; 
import CreateAccountPage from './pages/CreateAccountPage'; 
import LoginPage from './pages/LoginPage';
import ProductDetails from './pages/ProductDetails';
import Layout from './components/Layout';
import AuctionDetailsPage from './pages/AuctionDetailsPage'; 

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
      <Layout>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/list-product" element={<ListProductPage />} />
          <Route path="/bid" element={<BiddingPage />} />
          <Route path="/details" element={<ProductDetails />} />
          <Route path="/auction/:id" element={<AuctionDetailsPage/>} />
          {/* Add other routes as needed */}
        </Routes>
        <Footer />
        </Layout>
      </Router>
    </ChakraProvider>
  );
}

export default App;
