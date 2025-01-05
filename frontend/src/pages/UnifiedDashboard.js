import React, { useState } from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from "@chakra-ui/react";
import BuyerDashboard from "./BuyerDashboard";
import SellerDashboard from "./SellerDashboard";

const UnifiedDashboard = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <Heading mb={6} color={textColor}>
        Dashboards
      </Heading>

      {/* Tabs for Toggle */}
      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList>
          <Tab>Buyer View</Tab>
          <Tab>Seller View</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BuyerDashboard />
          </TabPanel>
          <TabPanel>
            <SellerDashboard />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default UnifiedDashboard;
