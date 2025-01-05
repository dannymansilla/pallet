import { Box, Progress } from "@chakra-ui/react";

const ProgressBar = ({ progress }) => (
  <Box w="100%">
    <Progress value={progress} size="sm" colorScheme="green" />
  </Box>
);

export default ProgressBar;