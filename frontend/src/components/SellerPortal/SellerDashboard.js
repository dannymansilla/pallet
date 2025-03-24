import React from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";

/**
 * 1) Updated sample data for top-level metrics (unchanged).
 */
const sampleSellerStats = {
  customerEngagement: {
    lastMonthActivePercent: 68, // e.g., 68% of the seller’s buyers were active
    MoMChange: 5.2,            // e.g., up 5.2% from previous month
  },
  volume: {
    currentMonth: "March 2025",
    currentMonthListValue: 230000, // e.g., $230,000 total list value
    MoMChange: 12.5,               // e.g., 12.5% increase from previous month
  },
  recoveryRate: {
    // e.g., previous month had $120k in list value, and $95k was sold
    prevMonthListValue: 120000,
    prevMonthSoldValue: 95000,
  },
  carriedOverValue: 25000, // e.g., $25k in unsold inventory carried over
};

/**
 * 2) New monthly data for the "Sales Over Time" chart.
 *    Each entry has three values:
 *    - listValue    (total listed inventory price for that month)
 *    - soldListValue (the subset of that month's list that actually sold)
 *    - actualSales   (the real dollars generated from those sold products)
 */
const sampleMonthlyData = [
  { month: "Jan '25", listValue: 100000, soldListValue: 80000, actualSales: 78000 },
  { month: "Feb '25", listValue: 110000, soldListValue: 85000, actualSales: 82000 },
  { month: "Mar '25", listValue: 120000, soldListValue: 90000, actualSales: 87000 },
  { month: "Apr '25", listValue: 95000,  soldListValue: 75000, actualSales: 71000 },
  { month: "May '25", listValue: 105000, soldListValue: 82000, actualSales: 80000 },
  { month: "Jun '25", listValue: 125000, soldListValue: 93000, actualSales: 89000 },
  { month: "Jul '25", listValue: 130000, soldListValue: 100000, actualSales: 96000 },
  { month: "Aug '25", listValue: 140000, soldListValue: 108000, actualSales: 100000 },
  { month: "Sep '25", listValue: 145000, soldListValue: 110000, actualSales: 104000 },
  { month: "Oct '25", listValue: 150000, soldListValue: 115000, actualSales: 108000 },
  { month: "Nov '25", listValue: 155000, soldListValue: 118000, actualSales: 112000 },
  { month: "Dec '25", listValue: 160000, soldListValue: 120000, actualSales: 115000 },
];

/**
 * 3) Remaining sample data for tables (unchanged).
 */
const sampleAuctions = [
  {
    auctionId: "AUC-001",
    products: 45,
    totalBids: 32,
    startDate: "2025-03-01",
    endDate: "2025-03-05",
    status: "Completed",
  },
  {
    auctionId: "AUC-002",
    products: 36,
    totalBids: 27,
    startDate: "2025-03-10",
    endDate: "2025-03-15",
    status: "Completed",
  },
  {
    auctionId: "AUC-003",
    products: 50,
    totalBids: 40,
    startDate: "2025-03-20",
    endDate: "2025-03-25",
    status: "Live",
  },
];

const sampleProducts = [
  {
    productId: "PRD-101",
    name: "Protein Bars - Vanilla",
    totalRevenue: 30000,
    totalBids: 40,
  },
  {
    productId: "PRD-102",
    name: "Energy Drink - Citrus",
    totalRevenue: 20000,
    totalBids: 25,
  },
  {
    productId: "PRD-103",
    name: "Trail Mix - Cranberry",
    totalRevenue: 15000,
    totalBids: 20,
  },
];

const sampleBuyers = [
  {
    buyerId: "BUY-201",
    name: "Healthy Foods Inc.",
    totalBids: 10,
    totalSpent: 20000,
  },
  {
    buyerId: "BUY-202",
    name: "SuperStore Wholesale",
    totalBids: 8,
    totalSpent: 18000,
  },
  {
    buyerId: "BUY-203",
    name: "ValueMart",
    totalBids: 6,
    totalSpent: 14000,
  },
];

const SellerDashboard = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("gray.200", "gray.700");

  // Compute any derived data for the Recovery Rate box
  const { prevMonthListValue, prevMonthSoldValue } = sampleSellerStats.recoveryRate;
  const recoveryPercent = ((prevMonthSoldValue / prevMonthListValue) * 100).toFixed(1);
  const difference = (prevMonthListValue - prevMonthSoldValue).toLocaleString();

  return (
    <Box p={6}>
      {/* Page Title */}
      <Heading mb={6}>Seller Dashboard</Heading>

      {/* Key Metric Boxes */}
      <SimpleGrid columns={[1, 2, 4]} spacing="20px" mb={6}>
        {/* 1) Customer Engagement */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="md"
          p={4}
        >
          <Stat>
            <StatLabel>Customer Engagement</StatLabel>
            <StatNumber>
              {sampleSellerStats.customerEngagement.lastMonthActivePercent}%
            </StatNumber>
            <StatHelpText>
              Active bidders last month
              <MoMChangeIndicator change={sampleSellerStats.customerEngagement.MoMChange} />
            </StatHelpText>
          </Stat>
        </Box>

        {/* 2) Volume */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="md"
          p={4}
        >
          <Stat>
            <StatLabel>Volume ({sampleSellerStats.volume.currentMonth})</StatLabel>
            <StatNumber>
              $
              {sampleSellerStats.volume.currentMonthListValue.toLocaleString()}
            </StatNumber>
            <StatHelpText>
              Total List Price Value
              <MoMChangeIndicator change={sampleSellerStats.volume.MoMChange} />
            </StatHelpText>
          </Stat>
        </Box>

        {/* 3) Recovery Rate */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="md"
          p={4}
        >
          <Stat>
            <StatLabel>Recovery Rate</StatLabel>
            <StatNumber>{recoveryPercent}%</StatNumber>
            <StatHelpText>
              ${prevMonthListValue.toLocaleString()} listed vs. $
              {prevMonthSoldValue.toLocaleString()} sold
              <br />
              (${difference} difference)
            </StatHelpText>
          </Stat>
        </Box>

        {/* 4) Carried Over */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="md"
          p={4}
        >
          <Stat>
            <StatLabel>Carried Over</StatLabel>
            <StatNumber>
              ${sampleSellerStats.carriedOverValue.toLocaleString()}
            </StatNumber>
            <StatHelpText>Into Current Month</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Sales Over Time (Chart) */}
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorderColor}
        borderRadius="md"
        p={4}
        mb={6}
      >
        <Heading size="md" mb={4}>
          Monthly Inventory & Sales
        </Heading>
        <Box height="350px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              {/* 1) Total Listed Value */}
              <Line
                type="monotone"
                dataKey="listValue"
                name="Total List Value"
                stroke="#3182CE"    // Blue
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              {/* 2) Sold List Value */}
              <Line
                type="monotone"
                dataKey="soldListValue"
                name="Sold (List Value)"
                stroke="#E53E3E"    // Red
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              {/* 3) Actual Sales */}
              <Line
                type="monotone"
                dataKey="actualSales"
                name="Actual Sales"
                stroke="#38A169"    // Green
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Recent Auctions Table */}
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorderColor}
        borderRadius="md"
        p={4}
        mb={6}
      >
        <Heading size="md" mb={4}>
          Recent Auctions
        </Heading>
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>Auction ID</Th>
              <Th>Products</Th>
              <Th>Total Bids</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sampleAuctions.map((auc) => (
              <Tr key={auc.auctionId}>
                <Td>{auc.auctionId}</Td>
                <Td>{auc.products}</Td>
                <Td>{auc.totalBids}</Td>
                <Td>{auc.startDate}</Td>
                <Td>{auc.endDate}</Td>
                <Td>
                  <Text
                    color={auc.status === "Live" ? "green.500" : "gray.500"}
                  >
                    {auc.status}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* 2-Column Layout: Top Products & Top Buyers */}
      <SimpleGrid columns={[1, 2]} spacing="20px">
        {/* Top Products */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="md"
          p={4}
        >
          <Heading size="md" mb={4}>
            Top Products
          </Heading>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>Revenue</Th>
                <Th>Bids</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sampleProducts.map((product) => (
                <Tr key={product.productId}>
                  <Td>{product.name}</Td>
                  <Td>${product.totalRevenue.toLocaleString()}</Td>
                  <Td>{product.totalBids}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Top Buyers */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="md"
          p={4}
        >
          <Heading size="md" mb={4}>
            Top Buyers
          </Heading>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Buyer</Th>
                <Th>Total Bids</Th>
                <Th>Total Spent</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sampleBuyers.map((buyer) => (
                <Tr key={buyer.buyerId}>
                  <Td>{buyer.name}</Td>
                  <Td>{buyer.totalBids}</Td>
                  <Td>${buyer.totalSpent.toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

/**
 * Reusable indicator for Month-over-Month changes
 * - Displays arrow up/down icon in green/red depending on sign
 */
const MoMChangeIndicator = ({ change }) => {
  const isPositive = change >= 0;
  const color = isPositive ? "green.500" : "red.500";
  const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <Box as="span" ml={2} color={color} fontWeight="bold">
      <Icon mx="2px" />
      {Math.abs(change).toFixed(1)}%
    </Box>
  );
};

export default SellerDashboard;
