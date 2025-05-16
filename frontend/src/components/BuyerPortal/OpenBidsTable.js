import React, { useState, useEffect, useMemo } from "react";
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
  Spinner,
  Center,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import cardboardbox from "../../images/cardboardbox.png";
import { getSellerOpenBids } from "../../services/api";
import { useDataMode } from "../../context/DataModeContext";

/**
 * Dummy open bid data structure
 * You'll replace this with real data from your state or backend
 */
const sampleOpenBids = [
  {
    warehouseId: "W1",
    warehouseName: "All Bids",
    bids: [
      {
        id: "B-001",
        product_brand: "Healthy Foods",
        product_name: "Protein Bar - Chocolate",
        bid_price: 2000,
        bid_quantity: 500,
        pallets: 5,
        units_per_pallet: 100,
        buyer_name: "Buyer Company A",
        timestamp: "2024-03-21T12:00:00Z",
        timestamp_formatted: "Mar 21, 2024"
      },
      {
        id: "B-002",
        product_brand: "Power Drinks",
        product_name: "Energy Drink - Citrus",
        bid_price: 1800,
        bid_quantity: 300,
        pallets: 3,
        units_per_pallet: 100,
        buyer_name: "Buyer Company B",
        timestamp: "2024-03-21T11:30:00Z",
        timestamp_formatted: "Mar 21, 2024"
      }
    ]
  }
];

/**
 * Subcomponent that renders a sortable, filterable table of bids
 */
const WarehouseBidsTable = ({ bids }) => {
  const navigate = useNavigate();

  // 1) Define column config for consistent widths + sorting/filter logic
  //    (We'll track a 'key', 'label', whether it's numeric, and a width)
  const columns = [
    { key: "brand", label: "Brand", isNumeric: false, width: "15%" },
    { key: "productName", label: "Product", isNumeric: false, width: "35%" },
    { key: "pricePerPallet", label: "Price / Pallet", isNumeric: true, width: "15%" },
    { key: "pallets", label: "# of Pallets", isNumeric: true, width: "10%" },
    { key: "totalValue", label: "Total Value", isNumeric: true, width: "15%" },
  ];

  // 2) Create a derived array of bids with 'totalValue' so we can sort/filter easily
  //    We'll add totalValue = pricePerPallet * pallets
  const initialData = bids.map((bid) => ({
    ...bid,
    totalValue: bid.pricePerPallet * bid.pallets,
  }));

  // 3) State for filters (one per column), plus which column is being sorted + order
  const [filters, setFilters] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {})
  );
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // 'asc' or 'desc'

  // 4) Handle filter changes
  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  // 5) Filter function (case-insensitive substring match)
  const filterRows = (data) => {
    return data.filter((row) => {
      return columns.every((col) => {
        // 'row[col.key]' might be a string or number
        const cellValue = String(row[col.key] || "").toLowerCase();
        const filterValue = filters[col.key].toLowerCase().trim();
        if (!filterValue) return true; // No filter => pass
        return cellValue.includes(filterValue);
      });
    });
  };

  // 6) Sort function
  const sortRows = (data) => {
    if (!sortColumn) return data; // no sort
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

  // 7) Combine filtering + sorting
  const filtered = filterRows(initialData);
  const finalData = sortRows(filtered);

  // 8) On column header click => sort
  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      // Toggle asc/desc
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Start sorting by this column, default ascending
      setSortColumn(colKey);
      setSortOrder("asc");
    }
  };

  // 9) Render
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
              {/* Show an indicator if this column is actively sorted */}
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
        {finalData.map((bid) => (
          <Tr
            key={bid.productId}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
            onClick={() => navigate(`/products/${bid.productId}`)}
          >
            <Td width={columns[0].width}>{bid.brand}</Td>
            <Td width={columns[1].width}>
              <Flex align="center" gap={3}>
                <Image
                  src={cardboardbox}
                  alt={bid.productName}
                  boxSize="40px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Text>{bid.productName}</Text>
              </Flex>
            </Td>
            <Td isNumeric width={columns[2].width}>
              ${bid.pricePerPallet.toLocaleString()}
            </Td>
            <Td isNumeric width={columns[3].width}>
              {bid.pallets}
            </Td>
            <Td isNumeric width={columns[4].width}>
              ${bid.totalValue.toLocaleString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const OpenBidsTable = ({ sellerId, useSampleData, bids: propBids }) => {
  const navigate = useNavigate();
  const { useSampleData: globalUseSampleData } = useDataMode();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Column definitions
  const columns = [
    { key: "product_brand", label: "Brand", isNumeric: false },
    { key: "product_name", label: "Product Name", isNumeric: false },
    { key: "bid_price", label: "Bid Price", isNumeric: true },
    { key: "bid_quantity", label: "Units", isNumeric: true },
    { key: "pallets", label: "Pallets", isNumeric: true },
    { key: "buyer_name", label: "Buyer", isNumeric: false },
    { key: "timestamp_formatted", label: "Date", isNumeric: false },
  ];

  // State for filters and sorting
  const [filters, setFilters] = useState(
    columns.reduce((obj, col) => ({ ...obj, [col.key]: "" }), {})
  );
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      if (!globalUseSampleData) {
        try {
          setLoading(true);
          // If we have bids passed as props, use those
          if (propBids && propBids.length > 0) {
            console.log('Using prop bids:', propBids); // Debug log
            setBids([{
              warehouseId: "W1",
              warehouseName: "All Bids",
              bids: propBids
            }]);
          } else {
            const response = await getSellerOpenBids(sellerId);
            if (!response?.data) {
              setBids([]);
              return;
            }
            setBids([{
              warehouseId: "W1",
              warehouseName: "All Bids",
              bids: response.data
            }]);
          }
        } catch (err) {
          console.error("Error fetching bids:", err);
          setError("Failed to load bids. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        setBids(sampleOpenBids);
        setLoading(false);
      }
    };

    fetchBids();
  }, [sellerId, globalUseSampleData, propBids]);

  // Filter function
  const filterRows = (rows) => {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.filter((row) => {
      return columns.every((col) => {
        const filterValue = filters[col.key].toLowerCase().trim();
        if (!filterValue) return true;
        const cellValue = String(row[col.key] || "").toLowerCase();
        return cellValue.includes(filterValue);
      });
    });
  };

  // Sort function
  const sortRows = (rows) => {
    if (!rows || !Array.isArray(rows)) return [];
    if (!sortColumn) return rows;

    const colDef = columns.find((c) => c.key === sortColumn);
    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (colDef.isNumeric) {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        const compare = String(aVal || "").localeCompare(String(bVal || ""));
        return sortOrder === "asc" ? compare : -compare;
      }
    });
  };

  // Apply filters and sorting to bids within each warehouse
  const processWarehouseBids = (warehouse) => {
    const filtered = filterRows(warehouse.bids);
    const sorted = sortRows(filtered);
    return { ...warehouse, bids: sorted };
  };

  // Handlers
  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortOrder("asc");
    }
  };

  // Add handleRowClick function
  const handleRowClick = (bid) => {
    if (bid.listing_id) {
      navigate(`/product/${bid.listing_id}`);
    }
  };

  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("white", "gray.900");
  const hoverColor = useColorModeValue("gray.100", "gray.700");

  if (loading) {
    return (
      <Center p={6}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center p={6}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  if (!bids.length) {
    console.log('No bids to display. Current bids state:', bids); // Debug log
    return (
      <Center p={6}>
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="medium">
            No current bids to display
          </Text>
          <Text color="gray.500">
            There are no active bids at this time.
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Accordion allowMultiple>
      {bids.map((warehouse) => {
        const processedWarehouse = processWarehouseBids(warehouse);
        return (
          <AccordionItem
            key={warehouse.warehouseId}
            mb={4}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
          >
            <h2>
              <AccordionButton px={4} py={2}>
                <Box flex="1" textAlign="left">
                  <Heading size="md">{warehouse.warehouseName}</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>

            <AccordionPanel px={4} pb={4}>
              <Box overflowX="auto">
                <Table variant="simple" tableLayout="fixed" width="100%">
                  <Thead>
                    <Tr>
                      {columns.map((col) => (
                        <Th
                          key={col.key}
                          isNumeric={col.isNumeric}
                          cursor="pointer"
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                          {sortColumn === col.key && (sortOrder === "asc" ? " ↑" : " ↓")}
                        </Th>
                      ))}
                    </Tr>
                    <Tr>
                      {columns.map((col) => (
                        <Td key={`${col.key}-filter`} isNumeric={col.isNumeric}>
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
                    {processedWarehouse.bids.map((bid) => (
                      <Tr 
                        key={bid.id} 
                        _hover={{ bg: hoverColor, cursor: 'pointer' }}
                        onClick={() => handleRowClick(bid)}
                      >
                        <Td>{bid.product_brand}</Td>
                        <Td>{bid.product_name}</Td>
                        <Td isNumeric>${bid.bid_price.toLocaleString()}</Td>
                        <Td isNumeric>{bid.bid_quantity.toLocaleString()}</Td>
                        <Td isNumeric>{bid.pallets.toLocaleString()}</Td>
                        <Td>{bid.buyer_name}</Td>
                        <Td>{bid.timestamp_formatted}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default OpenBidsTable;
