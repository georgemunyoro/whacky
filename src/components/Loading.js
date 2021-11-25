import { Box, Spinner } from "@chakra-ui/react";

const Loading = ({ width, height }) => {
  return (
    <Box
      width={width}
      height={height}
      justifyContent="center"
      alignItems="center"
      display="flex"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Box>
  );
};
export default Loading;
