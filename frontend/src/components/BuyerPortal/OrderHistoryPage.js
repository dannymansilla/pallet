import React, { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";

// Sample data structure demonstrating multiple sellers & trucks per month
const sampleOrderHistory = [
  {
    id: 1,
    month: "January 2025",
    numberOfTrucks: 3,
    totalValue: 22000,
    sellers: [
      {
        sellerName: "Henkel",
        trucks: [
          {
            truckId: "T-001",
            warehouse: "Warehouse A",
            products: [
              {
                brandName: "Persil",
                productName: "Laundry Detergent",
                pricePerPallet: 2000,
                numberOfPallets: 2,
                totalValue: 4000,
              },
            ],
          },
          {
            truckId: "T-002",
            warehouse: "Warehouse A",
            products: [
              {
                brandName: "Persil",
                productName: "Laundry Detergent - Sensitive",
                pricePerPallet: 2500,
                numberOfPallets: 2,
                totalValue: 5000,
              },
            ],
          },
        ],
      },
      {
        sellerName: "Healthy Foods",
        trucks: [
          {
            truckId: "T-003",
            warehouse: "Warehouse B",
            products: [
              {
                brandName: "Healthy Foods",
                productName: "Protein Bar - Chocolate",
                pricePerPallet: 1200,
                numberOfPallets: 3,
                totalValue: 3600,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    month: "February 2025",
    numberOfTrucks: 2,
    totalValue: 8000,
    sellers: [
      {
        sellerName: "Muscle Co.",
        trucks: [
          {
            truckId: "T-010",
            warehouse: "Warehouse C",
            products: [
              {
                brandName: "Muscle Co.",
                productName: "Whey Isolate",
                pricePerPallet: 2000,
                numberOfPallets: 2,
                totalValue: 4000,
              },
            ],
          },
          {
            truckId: "T-011",
            warehouse: "Warehouse C",
            products: [
              {
                brandName: "Muscle Co.",
                productName: "Vegan Protein",
                pricePerPallet: 2000,
                numberOfPallets: 2,
                totalValue: 4000,
              },
            ],
          },
        ],
      },
    ],
  },
];

// A subcomponent that displays each seller’s data in a sortable, filterable table
const SellerSubTable = ({ sellerName, trucks }) => {
  //
  // 1) Flatten truck/product data into a single "row" list
  //
  const initialRows = trucks.flatMap((truck) =>
    truck.products.map((product) => ({
      ...product, // brandName, productName, pricePerPallet, numberOfPallets, totalValue
      truckId: truck.truckId,
      warehouse: truck.warehouse,
    }))
  );

  //
  // 2) Column definitions
  //
  // We’ll store them in an array so we can loop over columns for filter + sorting.
  // Each column has:
  //   key: the property in our row objects
  //   label: display name in the <Th>
  //   isNumeric: whether to treat sorting/filtering as numeric or string
  const columns = [
    { key: "truckId", label: "Truck ID", isNumeric: false },
    { key: "warehouse", label: "Warehouse", isNumeric: false },
    { key: "brandName", label: "Brand", isNumeric: false },
    { key: "productName", label: "Product Name", isNumeric: false },
    { key: "pricePerPallet", label: "Price / Pallet", isNumeric: true },
    { key: "numberOfPallets", label: "# of Pallets", isNumeric: true },
    { key: "totalValue", label: "Total Value", isNumeric: true },
  ];

  //
  // 3) State for filters and sorting
  //
  // filters: an object keyed by column key, e.g. { truckId: "", warehouse: "", ... }
  // sortColumn: which column is currently sorted
  // sortOrder: "asc" or "desc" or null
  //
  const [filters, setFilters] = useState(
    columns.reduce((obj, col) => ({ ...obj, [col.key]: "" }), {})
  );
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  //
  // 4) Filtering logic
  //
  // We do substring matching (case-insensitive) for both string and numeric columns
  //
  const filterRows = (rows) => {
    return rows.filter((row) => {
      return columns.every((col) => {
        const filterValue = filters[col.key].toLowerCase().trim();
        if (!filterValue) return true; // no filter => pass
        const cellValue = String(row[col.key]).toLowerCase();
        return cellValue.includes(filterValue);
      });
    });
  };

  //
  // 5) Sorting logic
  //
  // If sortColumn is null, we do no sorting
  // Otherwise we do either string or numeric compare
  //
  const sortRows = (rows) => {
    if (!sortColumn) return rows;

    const colDef = columns.find((c) => c.key === sortColumn);
    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (colDef.isNumeric) {
        // numeric sort
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        // string sort
        const compare = aVal.toString().localeCompare(bVal.toString());
        return sortOrder === "asc" ? compare : -compare;
      }
    });
  };

  //
  // 6) Derived final data
  //
  const filtered = filterRows(initialRows);
  const finalData = sortRows(filtered);

  //
  // 7) Handlers for filter changes and sorting
  //
  const handleFilterChange = (colKey, value) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      // If already sorting by this col, toggle asc/desc
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Start sorting by this col, default ascending
      setSortColumn(colKey);
      setSortOrder("asc");
    }
  };

  //
  // 8) Render
  //
  return (
    <Box mb={6}>
      <Text fontWeight="bold" mb={2}>
        {sellerName}
      </Text>

      <Table size="sm" mb={2}>
        <Thead>
          <Tr>
            {columns.map((col) => (
              <Th
                key={col.key}
                onClick={() => handleSort(col.key)}
                cursor="pointer"
                isNumeric={col.isNumeric}
              >
                {col.label}
                {sortColumn === col.key && (sortOrder === "asc" ? " ↑" : " ↓")}
              </Th>
            ))}
          </Tr>

          {/* Filter row */}
          <Tr>
            {columns.map((col) => (
              <Td key={col.key} isNumeric={col.isNumeric}>
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
          {finalData.map((row, idx) => (
            <Tr key={idx}>
              <Td>{row.truckId}</Td>
              <Td>{row.warehouse}</Td>
              <Td>{row.brandName}</Td>
              <Td>{row.productName}</Td>
              <Td isNumeric>${row.pricePerPallet.toLocaleString()}</Td>
              <Td isNumeric>{row.numberOfPallets}</Td>
              <Td isNumeric>${row.totalValue.toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export const OrderHistoryPage = () => {
  const [expandedRows, setExpandedRows] = useState([]);

  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("white", "gray.900");
  const hoverColor = useColorModeValue("gray.100", "gray.700");
  const subRowBg = useColorModeValue("gray.50", "gray.800");

  // Toggle expansion of a month row
  const toggleExpandRow = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  return (
    <Box p={6} bg={bgColor}>
      <Text fontSize="2xl" mb={6} fontWeight="bold">
        Order History
      </Text>
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        bg={tableBg}
        overflowX="auto"
      >
        {/* Top-level table by Month */}
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Month</Th>
              <Th># of Trucks</Th>
              <Th isNumeric>Total Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sampleOrderHistory.map((monthRecord) => {
              const isExpanded = expandedRows.includes(monthRecord.id);

              return (
                <React.Fragment key={monthRecord.id}>
                  {/* Month Row */}
                  <Tr
                    _hover={{ bg: hoverColor }}
                    onClick={() => toggleExpandRow(monthRecord.id)}
                    cursor="pointer"
                  >
                    <Td>{monthRecord.month}</Td>
                    <Td>{monthRecord.numberOfTrucks}</Td>
                    <Td isNumeric>
                      ${monthRecord.totalValue.toLocaleString()}
                    </Td>
                  </Tr>

                  {/* Expanded Detail Rows (by Seller) */}
                  {isExpanded && (
                    <Tr bg={subRowBg}>
                      {/* Span all columns in top-level table */}
                      <Td colSpan={3}>
                        <Box p={4}>
                          {monthRecord.sellers.map((seller, idx) => (
                            <SellerSubTable
                              key={idx}
                              sellerName={seller.sellerName}
                              trucks={seller.trucks}
                            />
                          ))}
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default OrderHistoryPage;
