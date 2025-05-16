import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Input,
  Switch,
  FormControl,
  FormLabel,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Center,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import { getAuctionTrucks } from "../../services/api";
import { useDataMode } from "../../context/DataModeContext";

// SAMPLE DATA for demonstration
const sampleSellerMonthsData = [
  {
    month: "2025-04",
    orders: [
      {
        buyer: "Acme Retailers",
        orderId: "O-S1001",
        numTrucks: 3,
        totalValue: 20000,
        paymentDue: "2025-03-15",
        isPaid: false,
        items: [
          { brand: "Persil", productName: "Persil Detergent", pricePerPallet: 4500, pallets: 3 },
          { brand: "Persil", productName: "Persil Pods", pricePerPallet: 3250, pallets: 2 },
        ],
      },
      {
        buyer: "Global Foods",
        orderId: "O-S1002",
        numTrucks: 2,
        totalValue: 17000,
        paymentDue: "2025-03-20",
        isPaid: true,
        items: [
          { brand: "Tide", productName: "Tide Pods", pricePerPallet: 3400, pallets: 5 },
        ],
      },
    ],
  },
  {
    month: "2025-03",
    orders: [
      {
        buyer: "Best Snacks Inc.",
        orderId: "O-S2001",
        numTrucks: 1,
        totalValue: 10000,
        paymentDue: "2025-02-28",
        isPaid: false,
        items: [
          { brand: "Dove", productName: "Dove Soap", pricePerPallet: 2500, pallets: 4 },
        ],
      },
    ],
  },
];

/** Sub-table for awarded items */
const AwardedItemsSubtable = ({ items }) => {
  const bgSubheader = useColorModeValue("gray.50", "gray.700");

  // Compute totalValue on the fly
  const enhanced = items.map((it) => ({
    ...it,
    totalValue: it.pricePerPallet * it.pallets,
  }));

  return (
    <Table variant="simple" size="sm" mt={2}>
      <Thead>
        <Tr bg={bgSubheader}>
          <Th>Brand</Th>
          <Th>Product Name</Th>
          <Th isNumeric>Price / Pallet</Th>
          <Th isNumeric># Pallets</Th>
          <Th isNumeric>Total Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        {enhanced.map((item, idx) => (
          <Tr key={idx}>
            <Td>{item.brand}</Td>
            <Td>{item.productName}</Td>
            <Td isNumeric>${item.pricePerPallet.toLocaleString()}</Td>
            <Td isNumeric>{item.pallets}</Td>
            <Td isNumeric>${item.totalValue.toLocaleString()}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

/** Main orders table for a single month */
const SellerOrdersTable = ({ orders }) => {
  const expandedBg = useColorModeValue("gray.50", "gray.800");

  const columns = [
    { key: "buyer", label: "Buyer", isNumeric: false, width: "15%" },
    { key: "orderId", label: "Order ID", isNumeric: false, width: "15%" },
    { key: "numTrucks", label: "# Trucks", isNumeric: true, width: "10%" },
    { key: "totalValue", label: "Total Value", isNumeric: true, width: "15%" },
    { key: "paymentDue", label: "Payment Due", isNumeric: false, width: "15%" },
    { key: "isPaid", label: "Payment Status", isNumeric: false, width: "15%" },
  ];

  const initialData = orders.map((o) => ({ ...o }));

  // Filter & sort
  const [filters, setFilters] = useState(() =>
    columns.reduce((acc, c) => ({ ...acc, [c.key]: "" }), {})
  );
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  const filterRows = (data) =>
    data.filter((row) =>
      columns.every((col) => {
        const cellValue = String(row[col.key] ?? "").toLowerCase();
        const filterValue = filters[col.key].toLowerCase().trim();
        if (!filterValue) return true;
        return cellValue.includes(filterValue);
      })
    );

  const sortRows = (data) => {
    if (!sortColumn) return data;
    const colDef = columns.find((c) => c.key === sortColumn);

    return [...data].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (colDef.isNumeric) {
        aVal = Number(aVal);
        bVal = Number(bVal);
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        const compare = String(aVal).localeCompare(String(bVal));
        return sortOrder === "asc" ? compare : -compare;
      }
    });
  };

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortOrder("asc");
    }
  };

  const toggleExpandRow = (orderId) => {
    setExpandedRow((prev) => (prev === orderId ? null : orderId));
  };

  const filtered = filterRows(initialData);
  const finalData = sortRows(filtered);

  return (
    <Table variant="simple" tableLayout="fixed" width="100%">
      <Thead>
        <Tr>
          <Th width="5%"></Th>
          {columns.map((col) => (
            <Th
              key={col.key}
              width={col.width}
              isNumeric={col.isNumeric}
              cursor="pointer"
              onClick={() => handleSort(col.key)}
            >
              {col.label}
              {sortColumn === col.key && (sortOrder === "asc" ? " ↑" : " ↓")}
            </Th>
          ))}
        </Tr>
        {/* Filter row */}
        <Tr>
          <Td />
          {columns.map((col) => (
            <Td key={`${col.key}-filter`} width={col.width} isNumeric={col.isNumeric}>
              <Input
                size="xs"
                placeholder="Filter..."
                value={filters[col.key]}
                onChange={(e) => handleFilterChange(col.key, e.target.value)}
              />
            </Td>
          ))}
        </Tr>
      </Thead>

      <Tbody>
        {finalData.map((order) => {
          const isExpanded = expandedRow === order.orderId;
          const paymentStatus = order.isPaid ? "Completed" : "Incomplete";

          return (
            <React.Fragment key={order.orderId}>
              <Tr
                _hover={{ bg: "gray.50", cursor: "pointer" }}
                onClick={() => toggleExpandRow(order.orderId)}
              >
                <Td>🚛 {isExpanded ? "▾" : "▸"}</Td>
                <Td>{order.buyer}</Td>
                <Td>{order.orderId}</Td>
                <Td isNumeric>{order.numTrucks}</Td>
                <Td isNumeric>${order.totalValue.toLocaleString()}</Td>
                <Td>{order.paymentDue}</Td>
                <Td>
                  {order.isPaid ? (
                    <Text color="green.600" fontWeight="bold">
                      {paymentStatus}
                    </Text>
                  ) : (
                    <Text color="red.600" fontWeight="bold">
                      {paymentStatus}
                    </Text>
                  )}
                </Td>
              </Tr>

              {isExpanded && (
                <Tr>
                  <Td colSpan={columns.length + 1} bg={expandedBg}>
                    <Box p={2}>
                      <Heading size="sm" mb={2}>
                        Awarded Items
                      </Heading>
                      <AwardedItemsSubtable items={order.items} />
                    </Box>
                  </Td>
                </Tr>
              )}
            </React.Fragment>
          );
        })}
      </Tbody>
    </Table>
  );
};

const EmptyStateMessage = ({ title, description }) => (
  <Center p={8}>
    <VStack spacing={4}>
      <Icon as={InfoIcon} w={8} h={8} color="gray.400" />
      <Text fontSize="lg" fontWeight="bold">{title}</Text>
      <Text color="gray.600" textAlign="center">{description}</Text>
    </VStack>
  </Center>
);

const AuctionTrucksPage = () => {
  const { useSampleData } = useDataMode();
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hooks for styling
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const summaryBg = useColorModeValue("gray.50", "gray.900");

  /** 
   * Load trucks data from the API or use sample data
   */
  const loadTrucks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useSampleData) {
        setAuctionData({
          auction_summary: {
            auction_name: "Closed Auction",
            auction_closed: "2025-03-31",
            total_trucks: 6,
            total_buyers_awarded: 3,
            total_auction_revenue: 47000
          },
          months: sampleSellerMonthsData
        });
      } else {
        const response = await getAuctionTrucks();
        if (response?.data) {
          setAuctionData(response.data);
        } else {
          setAuctionData(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch trucks", err);
      setError("Failed to fetch truck data. Please try again.");
      setAuctionData(null);
    } finally {
      setLoading(false);
    }
  }, [useSampleData]);

  // Call it on mount (and whenever `loadTrucks` changes)
  useEffect(() => {
    loadTrucks();
  }, [loadTrucks]);

  // ----------------------
  // Render
  // ----------------------
  return (
    <Box bg={bgColor} p={6} minH="100vh">
      {/* Header with summary */}
      <Flex direction="column" mb={6}>
        <Heading size="lg" mb={4}>Trucks by Month</Heading>

        {/* Auction Summary */}
        {auctionData?.auction_summary && (
          <Box p={4} bg={summaryBg} borderRadius="md">
            <Flex justify="space-between" wrap="wrap" gap={4}>
              <Box>
                <Text fontWeight="bold">{auctionData.auction_summary.auction_name}</Text>
                <Text color="gray.600">Closed: {auctionData.auction_summary.auction_closed}</Text>
              </Box>
              <Flex gap={6}>
                <Box>
                  <Text fontWeight="bold">Total Trucks</Text>
                  <Text>{auctionData.auction_summary.total_trucks}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Total Buyers</Text>
                  <Text>{auctionData.auction_summary.total_buyers_awarded}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Total Revenue</Text>
                  <Text>${auctionData.auction_summary.total_auction_revenue.toLocaleString()}</Text>
                </Box>
              </Flex>
            </Flex>
          </Box>
        )}
      </Flex>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner size="xl" />
        </Box>
      )}

      {/* Error State */}
      {!loading && error && (
        <Box minH="50vh">
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
          <Button onClick={loadTrucks} colorScheme="blue">
            Retry
          </Button>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && !auctionData && !useSampleData && (
        <EmptyStateMessage
          title="No Truck Data Available"
          description="Your truck data will appear here once you have active auctions and orders."
        />
      )}

      {/* Main Content */}
      {!loading && !error && auctionData && (
        <Accordion allowMultiple defaultIndex={[0]}>
          {(auctionData.months || []).sort((a, b) => b.month.localeCompare(a.month))
            .map((monthObj) => {
              // Convert "2025-03" -> "March 2025"
              const [year, mon] = monthObj.month.split("-");
              const date = new Date(+year, +mon - 1);
              const monthLabel = date.toLocaleString("default", {
                month: "long",
                year: "numeric",
              });

              // Summaries for this month
              const totalMonthTrucks = monthObj.orders.reduce(
                (sum, order) => sum + order.numTrucks,
                0
              );
              const totalMonthValue = monthObj.orders.reduce(
                (sum, order) => sum + order.totalValue,
                0
              );

              return (
                <AccordionItem
                  key={monthObj.month}
                  mb={4}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <h2>
                    <AccordionButton px={4} py={2}>
                      <Box flex="1" textAlign="left">
                        <Heading size="md">{monthLabel}</Heading>
                      </Box>
                      <Box mr={4}>
                        <Text>
                          {totalMonthTrucks} trucks • ${totalMonthValue.toLocaleString()}
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel px={4} pb={4}>
                    <Box overflowX="auto">
                      <SellerOrdersTable orders={monthObj.orders} />
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
        </Accordion>
      )}
    </Box>
  );
};

export default AuctionTrucksPage;
