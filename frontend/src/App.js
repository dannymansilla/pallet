// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; // Ensure you have your custom theme file
import Header from './components/Header';
import Footer from './components/Footer'; 
import HomePage from './pages/HomePage'; 
import LandingPage from './pages/LandingPage'; 
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
import AdminPage from './pages/AdminPage'; 
import SellerDashboard from "./pages/Dashboard/SellerDashboard";
import BuyerDashboard from "./pages/Dashboard/BuyerDashboard";
import UnifiedDashboard from "./pages/Dashboard/UnifiedDashboard";
import ProductSelectionPage from "./pages/auction/ProductSelectionPage";
import ListingCreationPage from "./pages/auction/ListingCreationPage";
import SellerNetworkPage from './pages/seller/SellerNetworkPage';
import ManageListingsPage from './pages/seller/ManageListingsPage';

function App() {
  return (
    <ChakraProvider theme={theme}>
      
      <Router>
      <AuthProvider>
      <Layout>
        <Header isAuthenticated/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<PrivateRoute Component={ProfilePage} />} />
          {/* <Route path="/admin" element={<PrivateRoute Component={AdminPage} />} /> */}
          <Route path="/buyer-dashboard" element={<PrivateRoute Component={BuyerDashboard} />} />
          <Route path="/seller-dashboard" element={<PrivateRoute Component={SellerDashboard} />} />
          <Route path="/unified-dashboard" element={<PrivateRoute Component={UnifiedDashboard} />} />
          <Route path="/seller/network" element={<PrivateRoute Component={SellerNetworkPage} />} />
          <Route path="/seller/manage-listings" element={<PrivateRoute Component={ManageListingsPage} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/list-product" element={<ListProductPage />} />
          <Route path="/bid" element={<BiddingPage />} />
          <Route path="/details" element={<ProductDetails />} />
          <Route path="/auction/:id" element={<AuctionDetailsPage/>} />
          <Route path="/onboarding/register" element={<CompanyRegistration />} />
          <Route path="/onboarding/accept-terms" element={<AcceptTerms />} />
          <Route path="/products/select" element={<ProductSelectionPage />} />
          <Route path="/listings/create" element={<ListingCreationPage />} />

          {/* Add other routes as needed */}
        </Routes>
        <Footer />
        </Layout>
        </AuthProvider>
      </Router>
      
    </ChakraProvider>
  );
}

export default App;
