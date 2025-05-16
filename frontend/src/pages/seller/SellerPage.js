import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, toast } from '@chakra-ui/react';
import { OpenBidsTable } from '../../components/OpenBidsTable';
import { getSellerProducts, getSellerOpenBids, getSellerOrderHistory } from '../../services/sellerServices';

/**
 * OPEN BIDS PAGE CONTENT
 */
const renderOpenBidsPage = () => (
  <Box>
    <Flex justify="space-between" align="center" mb={6}>
      <Heading size="md">Your Open Bids</Heading>
    </Flex>
    <OpenBidsTable 
      sellerId={sellerId} 
      useSampleData={useSampleData} 
      bids={sellerData?.bids || []}
    />
  </Box>
); 

const SellerPage = () => {
  const [sellerId, setSellerId] = useState('');
  const [useSampleData, setUseSampleData] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!useSampleData && sellerId) {
        setLoading(true);
        setError(null);
        try {
          const [productsData, bidsData, ordersData] = await Promise.all([
            getSellerProducts(sellerId),
            getSellerOpenBids(sellerId),
            getSellerOrderHistory(sellerId)
          ]);
          
          console.log('Bids data:', bidsData); // Debug log
          
          setSellerData({
            products: productsData.listings,
            bids: bidsData.data || [], // Ensure we're using the data property
            orders: ordersData,
            sellerInfo: productsData.seller_info,
            networkStatus: productsData.network_status
          });
        } catch (err) {
          console.error("Failed to fetch seller data:", err);
          setError(err.response?.data?.error || "Failed to load seller data");
          toast({
            title: "Error",
            description: "Failed to load seller data. Using sample data instead.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, useSampleData, toast]);

  /**
   * OPEN BIDS PAGE CONTENT
   */
  const renderOpenBidsPage = () => {
    console.log('Current bids in render:', sellerData?.bids); // Debug log
    return (
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md">Your Open Bids</Heading>
        </Flex>
        <OpenBidsTable 
          sellerId={sellerId} 
          useSampleData={useSampleData} 
          bids={sellerData?.bids || []}
        />
      </Box>
    );
  };

  return (
    <div>
      {renderOpenBidsPage()}
    </div>
  );
};

export default SellerPage; 