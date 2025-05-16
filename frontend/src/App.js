// src/App.js
import React, { useEffect } from "react";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import theme from "./theme/theme";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import TeamPage from "./pages/TeamPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import ProductDetails from "./pages/ProductDetails";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import CompanyRegistration from "./pages/Onboarding/CompanyRegistration";
import AcceptTerms from "./pages/Onboarding/AcceptTerms";
import AdminPage from "./pages/AdminPage";
import SellerPage from "./pages/buyer/SellerPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProductSelectionPage from "./pages/auction/ProductSelectionPage";
import ListingCreationPage from "./pages/auction/ListingCreationPage";
import SellerNetworkPage from "./pages/seller/SellerNetworkPage";
import AuctionTrucksPage from "./pages/seller/AuctionTruckPage";
import BuyerTruckPage from "./pages/buyer/BuyerTruckPage";
import ManageListingsPage from "./pages/seller/ManageListingsPage";
import MyBidsPage from "./pages/buyer/MyBidsPage";
import ListingSearchPage from "./pages/auction/ListingSearchPage";
import ListingDetailsPage from "./pages/auction/ListingDetailsPage";
import RequestDemoPage from "./pages/RequestDemoPage";
import { checkTokenValidity } from "./services/api";
import ScrollToTop from "./components/ScrollToTop";
import ProductDetailPage from "./components/ProductDetailPage";
import ChatWidget from "./components/ChatWidget";
import NotificationsPage from "./pages/NotificationsPage";
import ListingPage from "./pages/seller/ListingPage";
import SellerProductPage from "./pages/seller/SellerProductPage";
import { DataModeProvider } from "./context/DataModeContext";

// Wrapper component to handle route-based chat widget rendering
const ChatWidgetWrapper = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return !isLandingPage ? <ChatWidget /> : null;
};

// Main App component
function App() {
  useEffect(() => {
    checkTokenValidity(); // Verify token when the app starts
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <AuthProvider>
          <DataModeProvider>
            <Layout>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/requestdemo" element={<RequestDemoPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/details" element={<ProductDetails />} />
                <Route path="/onboarding/register" element={<CompanyRegistration />} />
                <Route path="/onboarding/accept-terms" element={<AcceptTerms />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sellerpage/:sellerId" element={<SellerPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/seller/listings" element={<ListingPage />} />
                <Route path="/seller/listings/:listingId" element={<SellerProductPage />} />

                {/* Private Routes */}
                <Route path="/profile" element={<PrivateRoute Component={ProfilePage} />} />
                <Route path="/auction-trucks" element={<PrivateRoute Component={AuctionTrucksPage} />} />
                <Route path="/buyer-trucks" element={<PrivateRoute Component={BuyerTruckPage} />} />
                <Route path="/seller/network" element={<PrivateRoute Component={SellerNetworkPage} />} />
                <Route path="/seller/manage-listings" element={<PrivateRoute Component={ManageListingsPage} />} />
                <Route path="/buyer/mybids" element={<PrivateRoute Component={MyBidsPage} />} />
                <Route path="/auction" element={<PrivateRoute Component={ListingSearchPage} />} />
                <Route path="/auction/details/:id" element={<PrivateRoute Component={ListingDetailsPage} />} />
                <Route path="/products/select" element={<PrivateRoute Component={ProductSelectionPage} />} />
                <Route path="/listings/create" element={<PrivateRoute Component={ListingCreationPage} />} />
                <Route path="/admin" element={<PrivateRoute Component={AdminPage} />} />
              </Routes>
              <ChatWidgetWrapper />
            </Layout>
          </DataModeProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
