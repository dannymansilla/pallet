// src/components/Form/CheckboxField.js

import { FormControl, FormLabel, Checkbox, FormErrorMessage } from "@chakra-ui/react";

const CheckboxField = ({
  label,
  isChecked,
  onChange,
  isRequired = false,
  error = null,
  ...rest
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error} {...rest}>
      <FormLabel>{label}</FormLabel>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
      >
        {label}
      </Checkbox>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default CheckboxField;
