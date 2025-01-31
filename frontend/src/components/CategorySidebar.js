import React from "react";
import { VStack, Text, Button, Icon, Box } from "@chakra-ui/react";
import { FiCoffee, FiBox, FiDroplet } from "react-icons/fi"; // Example icons

const CategorySidebar = ({ categories, selected, onSelect }) => {
  // Map icons to categories (as an example)
  const categoryIcons = {
    Beverages: FiCoffee,
    Snacks: FiBox,
    "Cleaning Supplies": FiDroplet,
  };

  return (
    <VStack
      align="start"
      spacing={4}
      p={4}
      bg="white" // Updated background to white
      borderRadius="lg"
      shadow="sm"
      border="1px solid"
      borderColor="gray.200" // Subtle border for separation
      maxH="calc(100vh - 64px)" // Adjust for sticky positioning
      overflowY="auto" // Scrollable for long lists
    >
      <Text fontWeight="bold" fontSize="lg" mb={4} color="gray.700">
        Categories
      </Text>
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onSelect(category)}
          variant="ghost"
          colorScheme="teal"
          justifyContent="flex-start"
          w="full"
          leftIcon={<Icon as={categoryIcons[category]} />}
          bg={selected === category ? "teal.100" : "transparent"} // Active category background
          color={selected === category ? "teal.700" : "gray.700"} // Active category text color
          _hover={{ bg: "teal.50", transform: "scale(1.02)" }} // Subtle hover effect
          _active={{ bg: "teal.200" }}
          borderRadius="md"
          shadow={selected === category ? "sm" : "none"} // Slight shadow for active category
        >
          {category}
        </Button>
      ))}
    </VStack>
  );
};

export default CategorySidebar;
