import { Box, Heading, Text } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

export default function SignUpSuccessful() {
  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <CheckCircleIcon boxSize={"50px"} color={"green.500"} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        You're almost there...
      </Heading>
      <Text color={"gray.500"}>
        Check your inbox for an email containing your verification link to
        continue.
      </Text>
    </Box>
  );
}
