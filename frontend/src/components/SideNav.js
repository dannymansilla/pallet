import React, { useState } from 'react';
import {
  Box,
  VStack,
  Divider,
  Text,
  IconButton,
  Flex
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
    background:'transparent',
    color: 'black',
    textDecoration: 'none',
  };
}

// SAMPLE DATA: old "buyer" accordion data you want to place in the new nav
const yourSellersData = [
  { id: 'sellerA', name: 'Daily Health' },
  { id: 'sellerB', name: 'Best Snacks Co.' },
  { id: 'sellerH', name: 'Power Protein Inc.' },
  { id: 'sellerI', name: 'Alpha Foods' },
  { id: 'sellerJ', name: 'Healthy Snacks Inc.' },
];
const moreSellersData = [
  { id: 'sellerC', name: 'Tasty Foods' },
  { id: 'sellerD', name: 'Organic Wholesale' },
  { id: 'sellerE', name: 'Global Gourmet' },
  { id: 'sellerF', name: 'Budget Foods' },
  { id: 'sellerG', name: 'Snack Attack LLC' },
];

export default function SideNav({ user, isCollapsed, onToggleCollapse }) {
  // Expand/collapse states
  const [showBuyerSection, setShowBuyerSection] = useState(true);
  const [showSellerSection, setShowSellerSection] = useState(true);

  // New sections
  const [showYourSellers, setShowYourSellers] = useState(false);
  const [showMoreSellers, setShowMoreSellers] = useState(false);

  // If user not logged in or not approved, hide entire sidebar
  if (!user || user?.company?.status !== 'approved') return null;

  // Roles
  const hasBuyerRole =
    user.company.roles.includes('buyer') || user.company.roles.includes('both');
  const hasSellerRole =
    user.company.roles.includes('seller') || user.company.roles.includes('both');

  // Grab the company name from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const companyName = storedUser?.company?.name || 'Profile';

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
      zIndex={9998}
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
        {/* If Buyer Role: Show Company Name Section */}
        {hasBuyerRole && (
          <>
            {/* 1) Company Name Collapsible Section (was "Buyer") */}
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
              {isCollapsed ? companyName : companyName}
            </Text>

            {/* Buyer sub-links */}
            {!isCollapsed && showBuyerSection && (
              <>
                <NavLink to="/dashboard" style={linkStyle}>
                  Marketplace
                </NavLink>
                {/* <NavLink to="/auction" style={linkStyle}>
                  Auctions
                </NavLink> */}
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
              {isCollapsed ? 'Sellers' : 'Your Sellers'}
            </Text>

            {!isCollapsed && showYourSellers && (
              <>
                <Box pl={0}>
                  {yourSellersData.map((seller) => (
                    <NavLink
                      key={seller.id}
                      to="/sellerpage"
                      as={NavLink}
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
              {isCollapsed ? 'More' : 'More Sellers'}
            </Text>

            {!isCollapsed && showMoreSellers && (
              <>
                <Box pl={0}>
                  {moreSellersData.map((seller) => (
                    <NavLink
                      key={seller.id}
                      to="/sellerpage"
                      as={NavLink}
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
        {hasSellerRole && (
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
              {isCollapsed ? 'Seller' : 'Seller'}
            </Text>

            {!isCollapsed && showSellerSection && (
              <>
                <NavLink to="/dashboard" style={linkStyle}>
                  Dashboard
                </NavLink>
                <NavLink to="/seller/listings" style={linkStyle}>
                  Listings
                </NavLink>
                {/* <NavLink to="/seller/manage-listings" style={linkStyle}>
                  Manage Listings
                </NavLink> */}
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
