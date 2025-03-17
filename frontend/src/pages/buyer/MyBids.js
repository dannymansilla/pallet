import React, { useState, useEffect } from "react";
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td, Button, Text
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { fetchMyBids } from "../../services/api";

const MyBidsPage = () => {
  const [bids, setBids] = useState({ active: [], won: [], lost: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const loadBids = async () => {
      const data = await fetchMyBids();
      setBids(data);
    };
    loadBids();
  }, []);

  return (
    <Box minH="100vh" w="100%" maxW="1400px" mx="auto" py={6}>
      <Heading mb={4}>My Bids</Heading>
      <Text mb={4} fontSize="lg" fontWeight="medium">Track your current and past bids across auctions.</Text>

      <Tabs>
        <TabList>
          <Tab>Active</Tab>
          <Tab>Won</Tab>
          <Tab>Lost</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><BidTable bids={bids.active} navigate={navigate} /></TabPanel>
          <TabPanel><BidTable bids={bids.won} navigate={navigate} /></TabPanel>
          <TabPanel><BidTable bids={bids.lost} navigate={navigate} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

const BidTable = ({ bids, navigate }) => {
  if (!bids || bids.length === 0) {
    return (
      <Box textAlign="center" py={10} color="gray.600">
        <Text fontSize="lg">No bids found in this category.</Text>
        <Text fontSize="sm">Check back later for updates or start bidding now.</Text>
      </Box>
    );
  }

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Product</Th>
          <Th>Bid Price</Th>
          <Th>Quantity</Th>
          <Th>Auction End</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {bids.map((bid) => (
          <Tr key={bid.id}>
            <Td>{bid.listing.product_name}</Td>
            <Td>${parseFloat(bid.price_per_unit).toFixed(2)}</Td>
            <Td>{bid.quantity}</Td>
            <Td>{new Date(bid.listing.auction_end_date).toLocaleDateString()}</Td>
            <Td>
              <Button size="sm" variant="online" onClick={() => navigate(`/auction/details/${bid.listing.id}`)}>
                View Listing
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default MyBidsPage;
