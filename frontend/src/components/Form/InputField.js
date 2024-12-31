import { FormControl, FormLabel, Input, FormErrorMessage } from "@chakra-ui/react";

const InputField = ({
  label,
  placeholder,
  type = "text",
  name, // Explicitly destructuring 'name'
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
        name={name} // Pass 'name' to the input
        value={value}
        onChange={onChange} // Pass 'onChange' to the input
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
