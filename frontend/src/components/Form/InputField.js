// src/components/Form/InputField.js

import { FormControl, FormLabel, Input, FormErrorMessage } from "@chakra-ui/react";

const InputField = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  isRequired = false,
  error = null,
  ...rest
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error} {...rest}>
      <FormLabel>{label}</FormLabel>
      <Input
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
