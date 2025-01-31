import React from "react";
import { Input, Button, HStack, Box } from "@chakra-ui/react";

const SearchBar = ({ value, onSearch, onChange }) => {
  return (
    <HStack spacing={4} w="100%">
      <Input
        placeholder="Search by product name or description"
        value={value}
        onChange={onChange}
        flex="1" // Take up remaining space
      />
      <Button onClick={onSearch} colorScheme="teal">
        Search
      </Button>
    </HStack>
  );
};

export default SearchBar;
