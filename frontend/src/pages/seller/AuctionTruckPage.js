import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { fetchAuctionTrucks } from "../../services/api"; // Mock API call

/** 
 * SAMPLE DATA for demonstration (if your backend isn't ready yet).
 * This structure includes a 'months' array, each with 'orders'.
 * Each order has: buyer, orderId, numTrucks, totalValue, paymentDue, isPaid, items
 * 
 * The items' totalValue now properly sums to the order's totalValue.
 */
const sampleSellerMonthsData = [
  {
    month: "2025-03",
    orders: [
      {
        buyer: "Acme Retailers",
        orderId: "O-S1001",
        numTrucks: 3,
        totalValue: 20000, // Sum of the items below = 20,000
        paymentDue: "2025-03-15",
        isPaid: false,
        items: [
          {
            brand: "Persil",
            productName: "Persil Detergent",
            pricePerPallet: 4500,
            pallets: 3, // 4500 * 3 = 13,500
          },
          {
            brand: "Persil",
            productName: "Persil Pods",
            pricePerPallet: 3250,
            pallets: 2, // 3250 * 2 = 6,500
          },
          // 13,500 + 6,500 = 20,000
        ],
      },
      {
        buyer: "Global Foods",
        orderId: "O-S1002",
        numTrucks: 2,
        totalValue: 17000, // Sum of the items below = 17,000
        paymentDue: "2025-03-20",
        isPaid: true,
        items: [
          {
            brand: "Tide",
            productName: "Tide Pods",
            pricePerPallet: 3400,
            pallets: 5, // 3400 * 5 = 17,000
          },
        ],
      },
    ],
  },
  {
    month: "2025-02",
    orders: [
      {
        buyer: "Best Snacks Inc.",
        orderId: "O-S2001",
        numTrucks: 1,
        totalValue: 10000, // Sum of the items below = 10,000
        paymentDue: "2025-02-28",
        isPaid: false,
        items: [
          {
            brand: "Dove",
            productName: "Dove Soap",
            pricePerPallet: 2500,
            pallets: 4, // 2500 * 4 = 10,000
          },
        ],
      },
    ],
  },
];

/**
 * Sub-table of awarded items: brand, productName, pricePerPallet, # pallets, totalValue
 */
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

/**
 * The main table for orders in a single month
 * - Filterable / Sortable
 * - Expandable rows to show AwardedItemsSubtable
 */
const SellerOrdersTable = ({ orders }) => {
  const expandedBg = useColorModeValue("gray.50", "gray.800");

  // Columns: showing BUYER instead of SELLER
  const columns = [
    { key: "buyer", label: "Buyer", isNumeric: false, width: "15%" },
    { key: "orderId", label: "Order ID", isNumeric: false, width: "15%" },
    { key: "numTrucks", label: "# Trucks", isNumeric: true, width: "10%" },
    { key: "totalValue", label: "Total Value", isNumeric: true, width: "15%" },
    { key: "paymentDue", label: "Payment Due", isNumeric: false, width: "15%" },
    { key: "isPaid", label: "Payment Status", isNumeric: false, width: "15%" },
  ];

  // Convert orders to initial data
  const initialData = orders.map((o) => ({ ...o }));

  // Filter & sort states
  const [filters, setFilters] = useState(
    columns.reduce((acc, c) => ({ ...acc, [c.key]: "" }), {})
  );
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  // Which row is expanded?
  const [expandedRow, setExpandedRow] = useState(null);

  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  // Filtering
  const filterRows = (data) =>
    data.filter((row) =>
      columns.every((col) => {
        const cellValue = String(row[col.key] ?? "").toLowerCase();
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
            <Td
              key={`${col.key}-filter`}
              width={col.width}
              isNumeric={col.isNumeric}
            >
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
                {/* Truck Icon + Expand indicator */}
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

              {/* Expanded sub-row for items */}
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

const AuctionTrucksPage = ({ auctionId }) => {
  const [auctionData, setAuctionData] = useState(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    // Real call to fetch data from your backend
    // For demonstration, we mimic returning a structure with:
    // {
    //   auction_summary: { ...some summary info... },
    //   months: [...array of months... ]
    // }
    const loadTrucks = async () => {
      try {
        const response = await fetchAuctionTrucks(auctionId);
        // If your API doesn’t return 'months', you can adapt it,
        // or fallback to sampleSellerMonthsData
        setAuctionData(
          response?.data && response.data.months
            ? response.data
            : {
                auction_summary: {
                  auction_name: "March 2025 Auction",
                  auction_closed: "2025-03-20",
                  total_trucks: 6,
                  total_buyers_awarded: 3,
                  total_auction_revenue: 47000, 
                  // Matches the sum of 20k + 17k + 10k = 47k
                },
                months: sampleSellerMonthsData,
              }
        );
      } catch (error) {
        console.error("Failed to fetch trucks", error);
      }
    };
    loadTrucks();
  }, [auctionId]);

  if (!auctionData) {
    return <Text p={6}>Loading auction data...</Text>;
  }

  const { auction_summary, months } = auctionData;

  // Sort months descending => first is most recent
  const sortedMonths = [...months].sort((a, b) => b.month.localeCompare(a.month));
  const defaultOpenIndices = [0];

  return (
    <Box bg={bgColor} p={6} minH="100vh">
      {/* Month-by-month breakdown */}
      <Heading size="lg" mb={4}>
        Trucks by Month (Seller View)
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
                  <SellerOrdersTable orders={monthObj.orders} />
                </Box>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};

export default AuctionTrucksPage;
