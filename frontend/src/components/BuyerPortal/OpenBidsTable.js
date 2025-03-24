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

/**
 * Dummy open bid data structure
 * You’ll replace this with real data from your state or backend
 */
const sampleOpenBids = [
  {
    warehouseId: "W1",
    warehouseName: "Warehouse A",
    bids: [
      {
        productId: "P-001",
        productName: "Protein Bar - Chocolate",
        brand: "Healthy Foods",
        imageUrl: "/images/placeholder.png",
        pricePerPallet: 2000,
        pallets: 5,
      },
      {
        productId: "P-002",
        productName: "Energy Drink - Citrus",
        brand: "Power Drinks",
        imageUrl: "/images/placeholder.png",
        pricePerPallet: 1800,
        pallets: 3,
      },
    ],
  },
  {
    warehouseId: "W2",
    warehouseName: "Warehouse B",
    bids: [
      {
        productId: "P-004",
        productName: "Whey Isolate",
        brand: "Muscle Co.",
        imageUrl: "/images/placeholder.png",
        pricePerPallet: 2200,
        pallets: 2,
      },
      {
        productId: "P-005",
        productName: "Casein Protein",
        brand: "FitnessFuel",
        imageUrl: "/images/placeholder.png",
        pricePerPallet: 1500,
        pallets: 10,
      },
    ],
  },
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

const OpenBidsTable = () => {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Accordion allowMultiple>
      {sampleOpenBids.map((warehouse) => (
        <AccordionItem
          key={warehouse.warehouseId}
          mb={4}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
        >
          {/* The heading / title row (clickable) */}
          <h2>
            <AccordionButton px={4} py={2}>
              <Box flex="1" textAlign="left">
                <Heading size="md">{warehouse.warehouseName}</Heading>
              </Box>
              {/* AccordionIcon is the default caret icon */}
              <AccordionIcon />
            </AccordionButton>
          </h2>

          {/* The collapsible content */}
          <AccordionPanel px={4} pb={4}>
            <Box overflowX="auto">
              {/* Render the sortable/filterable subcomponent */}
              <WarehouseBidsTable bids={warehouse.bids} />
            </Box>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default OpenBidsTable;
