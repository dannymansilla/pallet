import React, { useState } from "react";
import {
  Box,
  Heading,
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
  Button,
  useToast,
} from "@chakra-ui/react";

/** 
 * SAMPLE DATA: 
 * Each month has an array of orders.
 * Each order has:
 *   seller, orderId, numTrucks, totalValue, paymentDue, isPaid, items[]
 * The 'items' array is used for the subtable.
 */
const sampleMonthsData = [
  {
    month: "2025-03", // most recent
    orders: [
      {
        seller: "Henkel",
        orderId: "O-1001",
        numTrucks: 2,
        totalValue: 15000,
        paymentDue: "2025-03-15",
        isPaid: false,
        items: [
          {
            brand: "Persil",
            productName: "Persil Detergent",
            pricePerPallet: 2500,
            pallets: 2,
          },
          {
            brand: "Persil",
            productName: "Persil Tabs",
            pricePerPallet: 2000,
            pallets: 1,
          },
        ],
      },
      {
        seller: "P&G",
        orderId: "O-1002",
        numTrucks: 3,
        totalValue: 22000,
        paymentDue: "2025-03-20",
        isPaid: true,
        items: [
          {
            brand: "Tide",
            productName: "Tide Pods",
            pricePerPallet: 2200,
            pallets: 4,
          },
        ],
      },
    ],
  },
  {
    month: "2025-02",
    orders: [
      {
        seller: "Unilever",
        orderId: "O-2001",
        numTrucks: 1,
        totalValue: 12000,
        paymentDue: "2025-02-28",
        isPaid: false,
        items: [
          {
            brand: "Dove",
            productName: "Dove Soap",
            pricePerPallet: 1800,
            pallets: 3,
          },
          {
            brand: "Dove",
            productName: "Dove Body Wash",
            pricePerPallet: 2000,
            pallets: 2,
          },
        ],
      },
    ],
  },
  {
    month: "2025-01",
    orders: [
      {
        seller: "Henkel",
        orderId: "O-3001",
        numTrucks: 2,
        totalValue: 4000,
        paymentDue: "2025-01-15",
        isPaid: true,
        items: [
          {
            brand: "Persil",
            productName: "Persil Liquid",
            pricePerPallet: 1900,
            pallets: 2,
          },
        ],
      },
      {
        seller: "Unilever",
        orderId: "O-3002",
        numTrucks: 1,
        totalValue: 3000,
        paymentDue: "2025-01-25",
        isPaid: false,
        items: [
          {
            brand: "Dove",
            productName: "Dove Lotion",
            pricePerPallet: 1500,
            pallets: 2,
          },
        ],
      },
    ],
  },
];

/** 
 * Subtable of awarded items that appear when an order row is expanded:
 * brand, productName, pricePerPallet, # pallets, totalValue
 */
const AwardedItemsSubtable = ({ items }) => {
  // We calculate totalValue on the fly.
  const withTotals = items.map((it) => ({
    ...it,
    totalValue: it.pricePerPallet * it.pallets,
  }));

  return (
    <Table variant="simple" size="sm" mt={2}>
      <Thead>
        <Tr bg={useColorModeValue("gray.50", "gray.700")}>
          <Th>Brand</Th>
          <Th>Product Name</Th>
          <Th isNumeric>Price / Pallet</Th>
          <Th isNumeric># Pallets</Th>
          <Th isNumeric>Total Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        {withTotals.map((item, idx) => (
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

/**
 * A reusable subcomponent for a filterable/sortable table of orders. 
 * Each row can be expanded to show the AwardedItemsSubtable.
 */
const OrdersTable = ({ orders }) => {
  const toast = useToast();
  const expandedBg = useColorModeValue("gray.50", "gray.800");

  // 1) Define columns for the order summary
  const columns = [
    { key: "seller", label: "Seller", isNumeric: false, width: "15%" },
    { key: "orderId", label: "Order ID", isNumeric: false, width: "15%" },
    { key: "numTrucks", label: "# Trucks", isNumeric: true, width: "10%" },
    { key: "totalValue", label: "Total Value", isNumeric: true, width: "15%" },
    { key: "paymentDue", label: "Payment Due", isNumeric: false, width: "15%" },
    { key: "isPaid", label: "Payment Status", isNumeric: false, width: "15%" },
  ];

  // 2) "initialData" for the table
  const initialData = orders.map((o) => ({ ...o }));

  // 3) State for filters
  const [filters, setFilters] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {})
  );

  // 4) Sort state
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  // 5) Expanded row (for showing items subtable)
  const [expandedRow, setExpandedRow] = useState(null);

  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  // Filtering
  const filterRows = (data) =>
    data.filter((row) =>
      columns.every((col) => {
        const cellValue = String(row[col.key] || "").toLowerCase();
        const filterValue = filters[col.key].toLowerCase().trim();
        if (!filterValue) return true;
        return cellValue.includes(filterValue);
      })
    );

  // Sorting
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

  const filtered = filterRows(initialData);
  const finalData = sortRows(filtered);

  // Toggle expanded row
  const toggleExpandRow = (orderId) => {
    setExpandedRow((prev) => (prev === orderId ? null : orderId));
  };

  // Payment handler
  const handlePay = () => {
    toast({
      title: "Payment",
      description: "Payments coming soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

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

          return (
            <React.Fragment key={order.orderId}>
              {/* Row for the order summary */}
              <Tr
                _hover={{ bg: "gray.50", cursor: "pointer" }}
                onClick={() => toggleExpandRow(order.orderId)}
              >
                {/* Truck Icon + Expand indicator */}
                <Td>
                  🚛 {isExpanded ? "▾" : "▸"}
                </Td>
                <Td>{order.seller}</Td>
                <Td>{order.orderId}</Td>
                <Td isNumeric>{order.numTrucks}</Td>
                <Td isNumeric>${order.totalValue.toLocaleString()}</Td>
                <Td>{order.paymentDue}</Td>
                {/* Payment Status Cell */}
                <Td>
                  {order.isPaid ? (
                    "Completed"
                  ) : (
                    <Button colorScheme="blue" size="sm" onClick={handlePay}>
                      Pay
                    </Button>
                  )}
                </Td>
              </Tr>

              {/* Sub-row for the awarded items (only if expanded) */}
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

/**
 * Main page: an Accordion of months (most recent up top).
 * The user can expand each month, which shows the OrdersTable.
 * Then each row in the table can be expanded to show awarded items.
 */
const BuyerTrucksPage = () => {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Sort months descending => the first item is the most recent
  const sortedMonths = [...sampleMonthsData].sort((a, b) =>
    b.month.localeCompare(a.month)
  );

  // We'll default to opening the first index (the most recent).
  const defaultOpenIndices = [0];

  return (
    <Box p={4} minH="85vh">
      <Heading size="lg" mb={6}>
        Your Trucks By Month
      </Heading>

      <Accordion allowMultiple defaultIndex={defaultOpenIndices}>
        {sortedMonths.map((monthObj) => {
          // Convert "2025-03" -> "March 2025"
          const [year, mon] = monthObj.month.split("-");
          const date = new Date(+year, +mon - 1);
          const monthLabel = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

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
                  <AccordionIcon />
                </AccordionButton>
              </h2>

              <AccordionPanel px={4} pb={4}>
                <Box overflowX="auto">
                  <OrdersTable orders={monthObj.orders} />
                </Box>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};

export default BuyerTrucksPage;
