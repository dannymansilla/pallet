import { Checkbox, FormControl, FormErrorMessage } from "@chakra-ui/react";

const CheckboxField = ({
  label,
  name,
  isChecked,
  onChange,
  error = null,
  ...rest
}) => {
  return (
    <FormControl isInvalid={!!error} {...rest}>
      <Checkbox
        name={name} // Pass 'name' to the checkbox
        isChecked={isChecked} // Use 'isChecked' to control the checkbox state
        onChange={onChange} // Pass 'onChange' to handle state updates
      >
        {label}
      </Checkbox>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default CheckboxField;
