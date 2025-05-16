import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Divider,
  Text,
  IconButton,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { getSellerNetwork, getBuyerDashboard } from '../services/api';
import { useDataMode } from '../context/DataModeContext';

// Reusable function to style your links
function linkStyle({ isActive }) {
  return {
    display: 'block',
    padding: '8px 12px',
    borderRadius: '8px',
    margin: '4px 0',
    background: isActive ? '#3182ce' : 'transparent',
    color: isActive ? 'white' : 'black',
    textDecoration: 'none',
  };
}

function linkSellerStyle({ isActive }) {
  return {
    display: 'block',
    padding: '8px 12px',
    borderRadius: '8px',
    margin: '4px 0',
    background: 'transparent',
    color: 'black',
    textDecoration: 'none',
  };
}

// Sample data for fallback
const sampleYourSellers = [
  { id: 'sellerA', name: 'Daily Health' },
  { id: 'sellerB', name: 'Best Snacks Co.' },
  { id: 'sellerH', name: 'Power Protein Inc.' },
  { id: 'sellerI', name: 'Alpha Foods' },
  { id: 'sellerJ', name: 'Healthy Snacks Inc.' },
];

const sampleMoreSellers = [
  { id: 'sellerC', name: 'Tasty Foods' },
  { id: 'sellerD', name: 'Organic Wholesale' },
  { id: 'sellerE', name: 'Global Gourmet' },
  { id: 'sellerF', name: 'Budget Foods' },
  { id: 'sellerG', name: 'Snack Attack LLC' },
];

export default function SideNav({ user, isCollapsed, onToggleCollapse }) {
  const toast = useToast();
  const { useSampleData, toggleDataMode } = useDataMode();
  
  // State for data
  const [yourSellers, setYourSellers] = useState([]);
  const [moreSellers, setMoreSellers] = useState([]);

  // Expand/collapse states
  const [showBuyerSection, setShowBuyerSection] = useState(true);
  const [showSellerSection, setShowSellerSection] = useState(true);
  const [showYourSellers, setShowYourSellers] = useState(false);
  const [showMoreSellers, setShowMoreSellers] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!useSampleData && user?.role) {
        try {
          if (user.role === 'buyer') {
            const response = await getBuyerDashboard();
            // Transform the seller data to ensure consistent ID format
            const transformedFavoriteSellers = (response.data?.favorite_sellers || []).map(seller => ({
              id: seller.id.toString(),
              name: seller.name
            }));
            const transformedOtherSellers = (response.data?.other_sellers || []).map(seller => ({
              id: seller.id.toString(),
              name: seller.name
            }));
            setYourSellers(transformedFavoriteSellers);
            setMoreSellers(transformedOtherSellers);
          } else if (user.role === 'seller') {
            const response = await getSellerNetwork();
            // Transform the seller data to ensure consistent ID format
            const transformedActiveNetwork = (response.data?.active_network || []).map(seller => ({
              id: seller.id.toString(),
              name: seller.name
            }));
            const transformedPendingRequests = (response.data?.pending_requests || []).map(seller => ({
              id: seller.id.toString(),
              name: seller.name
            }));
            setYourSellers(transformedActiveNetwork);
            setMoreSellers(transformedPendingRequests);
          }
        } catch (err) {
          console.error("Failed to fetch seller data:", err);
          // Only show error toast if there's an actual API failure
          if (err.response?.status >= 400) {
            toast({
              title: "Error",
              description: "Failed to load seller data. Please try again later.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } else {
        // Use sample data
        setYourSellers(sampleYourSellers);
        setMoreSellers(sampleMoreSellers);
      }
    };

    fetchData();
  }, [useSampleData, user?.role, toast, toggleDataMode]);

  // If user not logged in or not approved, hide entire sidebar
  if (!user || user?.organization?.approval_status !== 'approved') return null;

  // Check roles based on both role field and organization settings
  const isBuyer = user.role === 'buyer' || user.organization?.is_buyer;
  const isSeller = user.role === 'seller' || user.organization?.is_seller;

  // Get organization name from user context
  const organizationName = user.organization?.name || "Profile";

  // Adjust width if collapsed
  const sidebarWidth = isCollapsed ? '60px' : '200px';

  return (
    <Box
      as="nav"
      position="fixed"
      top="70px"
      left="0"
      height="calc(100vh - 70px)"
      width={sidebarWidth}
      bg="gray.100"
      overflowY="auto"
      overflowX="hidden"
      zIndex={998}
      transition="width 0.2s ease"
    >
      {/* Collapse Toggle */}
      <Flex
        position="absolute"
        top="50%"
        right="-12px"
        transform="translateY(-50%)"
        align="center"
        justify="center"
      >
        <IconButton
          size="sm"
          aria-label="Collapse sidebar"
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={onToggleCollapse}
          bg='rgb(58, 144, 247)'
        />
      </Flex>

      <VStack align="stretch" spacing={1} p={4}>
        {/* Data Toggle */}
        {!isCollapsed && (
          <FormControl display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor="sample-data" mb="0" mr={2} fontSize="sm">
              {/* Sample Data */}
            </FormLabel>
            <Switch
              id="sample-data"
              isChecked={useSampleData}
              onChange={(e) => {
                toggleDataMode(e.target.checked);
                // Clear the current sellers when switching data mode
                setYourSellers([]);
                setMoreSellers([]);
              }}
              size="sm"
            />
          </FormControl>
        )}

        {/* If Buyer Role: Show Company Name Section */}
        {isBuyer && (
          <>
            {/* 1) Company Name Collapsible Section */}
            <Text
              fontWeight="bold"
              mt={2}
              mb={1}
              cursor="pointer"
              onClick={() => setShowBuyerSection(!showBuyerSection)}
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {isCollapsed ? organizationName.charAt(0) : organizationName}
            </Text>

            {/* Buyer sub-links */}
            {!isCollapsed && showBuyerSection && (
              <>
                <NavLink to="/dashboard" style={linkStyle}>
                  Marketplace
                </NavLink>
                <NavLink to="/buyer/mybids" style={linkStyle}>
                  My Bids
                </NavLink>
                <NavLink to="/buyer-trucks" style={linkStyle}>
                  Truck History
                </NavLink>
                <Divider my={2} />
              </>
            )}

            {/* 2) Your Sellers Collapsible Section */}
            <Text
              fontWeight="bold"
              mt={2}
              mb={1}
              cursor="pointer"
              onClick={() => setShowYourSellers(!showYourSellers)}
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {isCollapsed ? 'S' : 'Your Sellers'}
            </Text>

            {!isCollapsed && showYourSellers && (
              <>
                <Box pl={0}>
                  {yourSellers.map((seller) => (
                    <NavLink
                      key={seller.id}
                      to={`/sellerpage/${seller.id}`}
                      style={linkSellerStyle}
                    >
                      {seller.name}
                    </NavLink>
                  ))}
                </Box>
                <Divider my={2} />
              </>
            )}

            {/* 3) More Sellers Collapsible Section */}
            <Text
              fontWeight="bold"
              mt={2}
              mb={1}
              cursor="pointer"
              onClick={() => setShowMoreSellers(!showMoreSellers)}
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {isCollapsed ? 'M' : 'More Sellers'}
            </Text>

            {!isCollapsed && showMoreSellers && (
              <>
                <Box pl={0}>
                  {moreSellers.map((seller) => (
                    <NavLink
                      key={seller.id}
                      to={`/sellerpage/${seller.id}`}
                      style={linkSellerStyle}
                    >
                      {seller.name}
                    </NavLink>
                  ))}
                </Box>
                <Divider my={2} />
              </>
            )}
          </>
        )}

        {/* If Seller Role: Show Seller Section */}
        {isSeller && (
          <>
            <Text
              fontWeight="bold"
              mt={2}
              mb={1}
              cursor="pointer"
              onClick={() => setShowSellerSection(!showSellerSection)}
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {isCollapsed ? 'S' : 'Seller Portal'}
            </Text>

            {!isCollapsed && showSellerSection && (
              <>
                <NavLink to="/dashboard" style={linkStyle}>
                  Dashboard
                </NavLink>
                <NavLink to="/seller/listings" style={linkStyle}>
                  Listings
                </NavLink>
                <NavLink to="/seller/network" style={linkStyle}>
                  Manage Network
                </NavLink>
                <NavLink to="/auction-trucks" style={linkStyle}>
                  Manage Trucks
                </NavLink>
                <Divider my={2} />
              </>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}
