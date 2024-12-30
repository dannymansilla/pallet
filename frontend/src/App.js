// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; // Ensure you have your custom theme file
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
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import CompanyRegistration from "./pages/Onboarding/CompanyRegistration";
import AcceptTerms from "./pages/Onboarding/AcceptTerms";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
      <Router>
      <Layout>
        <Header isAuthenticated/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<PrivateRoute Component={ProfilePage} />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/list-product" element={<ListProductPage />} />
          <Route path="/bid" element={<BiddingPage />} />
          <Route path="/details" element={<ProductDetails />} />
          <Route path="/auction/:id" element={<AuctionDetailsPage/>} />
          <Route path="/onboarding/register" element={<CompanyRegistration />} />
          <Route path="/onboarding/accept-terms" element={<AcceptTerms />} />
          {/* Add other routes as needed */}
        </Routes>
        <Footer />
        </Layout>
      </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
