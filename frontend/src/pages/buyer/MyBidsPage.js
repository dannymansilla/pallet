import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Image,
  useColorModeValue,
  Input,
  Center,
  Spinner,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import cardboardbox from "../../images/cardboardbox.png";
import { useDataMode } from "../../context/DataModeContext";
import { fetchMyBids } from "../../services/api";

// SAMPLE DATA: Replace with real data from your backend or state
const sampleMyBids = {
  "active": [
    {
      "id": 101,
      "listing": 201,
      "sale_event": 9,
      "buyer": 42,
      "bid_price": 7.00,
      "bid_quantity": 4800,
      "status": "active",
      "timestamp": "2025-05-16T12:01:33.000000Z",
      "listing_details": {
        "seller_name": "Daily Health",
        "product_name": "Protein Bar - Chocolate",
        "product_brand": "PowerProtein",
        "warehouse_name": "Main Warehouse",
        "product_id": "L-001",
        "price_per_pallet": 2500,
        "pallets": 4
      }
    },
    {
      "id": 102,
      "listing": 202,
      "sale_event": 9,
      "buyer": 42,
      "bid_price": 22.00,
      "bid_quantity": 3600,
      "status": "active",
      "timestamp": "2025-05-16T12:03:55.000000Z",
      "listing_details": {
        "seller_name": "Daily Health",
        "product_name": "Vegan Trail Mix",
        "product_brand": "Daily Health Snacks",
        "warehouse_name": "Main Warehouse",
        "product_id": "L-002",
        "price_per_pallet": 3200,
        "pallets": 3
      }
    },
    {
      "id": 103,
      "listing": 203,
      "sale_event": 9,
      "buyer": 42,
      "bid_price": 3.25,
      "bid_quantity": 4200,
      "status": "active",
      "timestamp": "2025-05-16T12:05:20.000000Z",
      "listing_details": {
        "seller_name": "Daily Health",
        "product_name": "Coconut Water Electrolyte Drink",
        "product_brand": "HydraLife",
        "warehouse_name": "Main Warehouse",
        "product_id": "L-003",
        "price_per_pallet": 2100,
        "pallets": 3
      }
    }
  ],
  "won": [],
  "lost": []
}

const getImageUrl = (image) => {
  if (process.env.NODE_ENV === 'production') {
    return '/static/media/cardboardbox.3a11b4e24ee4ded8288a.png';
  }
  return image;
};

const MyBidsTable = ({ bids }) => {
  const navigate = useNavigate();

  // Define the columns, now including 'status'
  const columns = [
    { key: "seller", label: "Seller", isNumeric: false, width: "12%" },
    { key: "brand", label: "Brand", isNumeric: false, width: "12%" },
    { key: "warehouse", label: "Warehouse", isNumeric: false, width: "12%" },
    { key: "productName", label: "Product", isNumeric: false, width: "20%" },
    { key: "pricePerPallet", label: "Price / Pallet", isNumeric: true, width: "10%" },
    { key: "pallets", label: "# of Pallets", isNumeric: true, width: "10%" },
    { key: "totalValue", label: "Total Value", isNumeric: true, width: "10%" },
    { key: "status", label: "Status", isNumeric: false, width: "14%" },
  ];

  // Build initial data array
  const initialData = bids.map((bid) => ({
    ...bid,
    totalValue: bid.pricePerPallet * bid.pallets,
  }));

  // Filter + Sort states
  const [filters, setFilters] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {})
  );
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  const filterRows = (data) =>
    data.filter((row) =>
      columns.every((col) => {
        const cellValue = String(row[col.key] || "").toLowerCase();
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

  const filtered = filterRows(initialData);
  const finalData = sortRows(filtered);

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortOrder("asc");
    }
  };

  const handleRowClick = (bid) => {
    if (bid.status === "Open") {
      navigate(`/product/${bid.productId}`);
    }
  };

  return (
    <Table variant="simple" tableLayout="fixed" width="100%">
      <Thead>
        <Tr>
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
        {finalData.map((bid, idx) => (
          <Tr
            key={idx}
            _hover={{ 
              bg: bid.status === "Open" ? "gray.50" : "inherit",
              cursor: bid.status === "Open" ? "pointer" : "default"
            }}
            onClick={() => handleRowClick(bid)}
          >
            <Td>{bid.seller}</Td>
            <Td>{bid.brand}</Td>
            <Td>{bid.warehouse}</Td>
            <Td>
              <Flex align="center" gap={3}>
                <Image
                  src={getImageUrl(cardboardbox)}
                  alt={bid.productName}
                  boxSize="40px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Text>{bid.productName}</Text>
              </Flex>
            </Td>
            <Td isNumeric>${bid.pricePerPallet.toLocaleString()}</Td>
            <Td isNumeric>{bid.pallets}</Td>
            <Td isNumeric>${bid.totalValue.toLocaleString()}</Td>
            <Td>{bid.status}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const MyBidsPage = () => {
  const { useSampleData } = useDataMode();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchBids = async () => {
      if (useSampleData) {
        // Transform sample data into the expected format
        const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2025-05"
        const transformedBids = [
          {
            month: currentMonth,
            isCurrentMonth: true,
            bids: sampleMyBids.active.map(bid => ({
              seller: bid.listing_details.seller_name,
              brand: bid.listing_details.product_brand,
              warehouse: bid.listing_details.warehouse_name,
              productName: bid.listing_details.product_name,
              pricePerPallet: bid.listing_details.price_per_pallet,
              pallets: bid.listing_details.pallets,
              status: "Open",
              productId: bid.listing_details.product_id
            }))
          }
        ];
        setBids(transformedBids);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // 1) Fetch raw response from your API
        const response = await fetchMyBids();

        // 2) If no response, show error
        if (!response) {
          setBids([]);
          setError("No response from server. Please try again later.");
          return;
        }

        // 3) Check if top-level `active`, `won`, `lost` exist
        if (!response.active && !response.won && !response.lost) {
          setBids([]);
          return;
        }

        // 4) Transform into the array structure your Accordion expects
        const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2025-05"
        const transformedBids = [
          {
            month: currentMonth,
            isCurrentMonth: true,
            bids: [
              ...(response.active || []).map((bid) => ({
                seller: bid.listing_details.seller_name,
                brand: bid.listing_details.product_brand,
                warehouse: bid.listing_details.warehouse_name,
                productName: bid.listing_details.product_name,
                pricePerPallet: bid.listing_details.price_per_pallet,
                pallets: bid.listing_details.pallets,
                status: "Open",
                productId: bid.listing_details.product_id,
              })),
              ...(response.won || []).map((bid) => ({
                seller: bid.listing_details.seller_name,
                brand: bid.listing_details.product_brand,
                warehouse: bid.listing_details.warehouse_name,
                productName: bid.listing_details.product_name,
                pricePerPallet: bid.listing_details.price_per_pallet,
                pallets: bid.listing_details.pallets,
                status: "Won",
                productId: bid.listing_details.product_id,
              })),
              ...(response.lost || []).map((bid) => ({
                seller: bid.listing_details.seller_name,
                brand: bid.listing_details.product_brand,
                warehouse: bid.listing_details.warehouse_name,
                productName: bid.listing_details.product_name,
                pricePerPallet: bid.listing_details.price_per_pallet,
                pallets: bid.listing_details.pallets,
                status: "Lost",
                productId: bid.listing_details.product_id,
              })),
            ],
          },
        ];

        setBids(transformedBids);
      } catch (err) {
        console.error("Error fetching bids:", err);
        let errorMessage = "Failed to load bids. Please try again later.";

        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Please log in to view your bids.";
              break;
            case 403:
              errorMessage = "You don't have permission to view bids.";
              break;
            case 404:
              errorMessage = "No bids found for your account.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              break;
          }
        } else if (err.request) {
          errorMessage = "Network error. Please check your connection.";
        }
        setError(errorMessage);
        setBids([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [useSampleData]);

  // Helper to format YYYY-MM => "May 2025"
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(+year, +month - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <Center p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text color="gray.500">Loading your bids...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center p={6}>
        <Alert status="error" borderRadius="md" maxW="600px">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>Error loading bids</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Text fontSize="sm" color="gray.500" mt={2}>
              If this problem persists, please contact support.
            </Text>
          </VStack>
        </Alert>
      </Center>
    );
  }

  if (!bids.length) {
    return (
      <Center p={6}>
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="medium">
            No bids to display
          </Text>
          <Text color="gray.500">
            You haven't placed any bids yet. Start bidding on products to see them here.
          </Text>
        </VStack>
      </Center>
    );
  }

  const defaultOpenIndices = bids
    .map((item, idx) => (item.isCurrentMonth ? idx : null))
    .filter((idx) => idx !== null);

  // If current month has no bids, show a specific message
  const currentMonthBids = bids.find((m) => m.isCurrentMonth)?.bids || [];
  if (currentMonthBids.length === 0) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={6}>
          My Bids
        </Heading>
        <VStack spacing={4} align="stretch">
          <Box p={6} borderWidth="1px" borderRadius="lg">
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              No current bids
            </Text>
            <Text color="gray.500">
              You don't have any active bids this month. Browse the marketplace to find products.
            </Text>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4} minH="85vh">
      <Heading size="lg" mb={6}>
        My Bids
      </Heading>

      {/* We only have 1 item in "bids" in this simplified transform, but if you had older months... */}
      {bids.map(({ month, isCurrentMonth, bids: monthBids }, index) => (
        <Box
          key={month}
          mb={4}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
        >
          <Accordion allowMultiple defaultIndex={defaultOpenIndices}>
            <AccordionItem>
              <AccordionButton px={4} py={2}>
                <Box flex="1" textAlign="left">
                  <Heading size="md">
                    {formatMonth(month)} {isCurrentMonth ? "(Current)" : "(History)"}
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={4} pb={4}>
                <Box overflowX="auto">
                  <MyBidsTable bids={monthBids} />
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      ))}
    </Box>
  );
};

export default MyBidsPage;
