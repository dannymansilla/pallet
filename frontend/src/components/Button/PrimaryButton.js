// src/components/Button/PrimaryButton.js

import { Button } from "@chakra-ui/react";

const PrimaryButton = ({ label, onClick, isDisabled = false, isLoading = false, ...rest }) => {
  return (
    <Button
      variant="solid"
      onClick={onClick}
      isDisabled={isDisabled}
      isLoading={isLoading}
      {...rest} // Pass any additional props (e.g., size, colorScheme)
    >
      {label}
    </Button>
  );
};

export default PrimaryButton;
