// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; // Ensure you have your custom theme file
import Header from './components/Header';
import Footer from './components/Footer'; 
import HomePage from './pages/HomePage'; 
import LandingPage from './pages/LandingPage'; 
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ProductDetails from './pages/ProductDetails';
import Layout from './components/Layout';
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
import ListingSearchPage from "./pages/auction/ListingSearchPage";
import ListingDetailsPage from "./pages/auction/ListingDetailsPage";

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
          <Route path="/team" element={<TeamPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<PrivateRoute Component={ProfilePage} />} />
          {/* <Route path="/admin" element={<PrivateRoute Component={AdminPage} />} /> */}
          <Route path="/buyer-dashboard" element={<PrivateRoute Component={BuyerDashboard} />} />
          <Route path="/seller-dashboard" element={<PrivateRoute Component={SellerDashboard} />} />
          <Route path="/unified-dashboard" element={<PrivateRoute Component={UnifiedDashboard} />} />
          <Route path="/seller/network" element={<PrivateRoute Component={SellerNetworkPage} />} />
          <Route path="/seller/manage-listings" element={<PrivateRoute Component={ManageListingsPage} />} />
          <Route path="/auction" element={<PrivateRoute Component={ListingSearchPage} />} />
          <Route path="/auction/details/:id" element={<PrivateRoute Component={ListingDetailsPage} />} />
          <Route path="/products/select" element={<ProductSelectionPage />} /> 
          <Route path="/listings/create" element={<ListingCreationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/details" element={<ProductDetails />} />
          <Route path="/onboarding/register" element={<CompanyRegistration />} />
          <Route path="/onboarding/accept-terms" element={<AcceptTerms />} />

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
