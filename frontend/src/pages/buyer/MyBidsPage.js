import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import cardboardbox from "../../images/cardboardbox.png";

// SAMPLE DATA: Replace with real data from your backend or state
const sampleMyBids = [
  {
    month: "2025-03",
    isCurrentMonth: true, // This month is "Open Bids"
    bids: [
      {
        seller: "Henkel",
        brand: "Persil",
        warehouse: "Warehouse X",
        productName: "Persil Detergent",
        pricePerPallet: 2500,
        pallets: 3,
        status: "Open", // Because it's current month
      },
      {
        seller: "P&G",
        brand: "Tide",
        warehouse: "Warehouse B",
        productName: "Tide Liquid",
        pricePerPallet: 2000,
        pallets: 2,
        status: "Open",
      },
    ],
  },
  {
    month: "2025-02",
    isCurrentMonth: false,
    bids: [
      {
        seller: "Unilever",
        brand: "Dove",
        warehouse: "Warehouse Y",
        productName: "Dove Soap - 24 Pack",
        pricePerPallet: 1800,
        pallets: 5,
        status: "Won",
      },
      {
        seller: "P&G",
        brand: "Tide",
        warehouse: "Warehouse A",
        productName: "Tide Pods",
        pricePerPallet: 2200,
        pallets: 2,
        status: "Lost",
      },
    ],
  },
  {
    month: "2025-01",
    isCurrentMonth: false,
    bids: [
      {
        seller: "Henkel",
        brand: "Persil",
        warehouse: "Warehouse Z",
        productName: "Persil Tabs",
        pricePerPallet: 2300,
        pallets: 4,
        status: "Lost",
      },
      {
        seller: "Unilever",
        brand: "Dove",
        warehouse: "Warehouse Q",
        productName: "Dove Body Wash",
        pricePerPallet: 1900,
        pallets: 3,
        status: "Won",
      },
    ],
  },
];

/**
 * A reusable subcomponent for a filterable/sortable table of bids.
 */
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

  // Create a derived array with totalValue
  const initialData = bids.map((bid) => ({
    ...bid,
    totalValue: bid.pricePerPallet * bid.pallets,
  }));

  // State for filters
  const [filters, setFilters] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {})
  );
  // State for sorting
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // 'asc' or 'desc'

  // Handle filter changes
  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  // Filtering
  const filterRows = (data) => {
    return data.filter((row) =>
      columns.every((col) => {
        const cellValue = String(row[col.key] || "").toLowerCase();
        const filterValue = filters[col.key].toLowerCase().trim();
        if (!filterValue) return true; // no filter => pass
        return cellValue.includes(filterValue);
      })
    );
  };

  // Sorting
  const sortRows = (data) => {
    if (!sortColumn) return data; // no active sort
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

  // Final data after combining filter + sort
  const filtered = filterRows(initialData);
  const finalData = sortRows(filtered);

  // Column header click => sort
  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortOrder("asc");
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
            _hover={{ bg: "gray.50", cursor: "pointer" }}
            onClick={() => navigate(`/products/${bid.productId || "some-id"}`)}
          >
            <Td>{bid.seller}</Td>
            <Td>{bid.brand}</Td>
            <Td>{bid.warehouse}</Td>
            <Td>
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

/**
 * Main page component that displays "My Bids" by month
 */
const MyBidsPage = () => {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // We want the current month to be expanded by default.
  // That means we find all indices where isCurrentMonth = true
  // and pass them to `defaultIndex`.
  const defaultOpenIndices = sampleMyBids.reduce((acc, item, idx) => {
    if (item.isCurrentMonth) acc.push(idx);
    return acc;
  }, []);

  // Helper to format YYYY-MM into something like "March 2025"
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(+year, +month - 1); 
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <Box p={4} minH={'85vh'}>
      <Heading size="lg" mb={6}>
        My Bids
      </Heading>

      {/* Pass `defaultIndex` to expand the current month by default */}
      <Accordion allowMultiple defaultIndex={defaultOpenIndices}>
        {sampleMyBids.map(({ month, isCurrentMonth, bids }, index) => (
          <AccordionItem
            key={month}
            mb={4}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
          >
            <h2>
              <AccordionButton px={4} py={2}>
                <Box flex="1" textAlign="left">
                  <Heading size="md">
                    {formatMonth(month)}{" "}
                    {isCurrentMonth ? "(Current)" : "(History)"}
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>

            <AccordionPanel px={4} pb={4}>
              <Box overflowX="auto">
                <MyBidsTable bids={bids} />
              </Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default MyBidsPage;
