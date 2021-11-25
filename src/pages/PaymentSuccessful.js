import { Box, Heading, Text } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router";
import { useCallback, useEffect } from "react";
import { supabase } from "../supabase";
import { useStoreState } from "easy-peasy";

export default function PaymentSuccessful() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useStoreState((s) => s.user);

  const handleSuccessfulPayment = useCallback(async () => {
    const query = new URLSearchParams(location.search);
    const isPaymentSuccessful = query.get("success");
    if (isPaymentSuccessful) {
      const sessionId = query.get("session_id");
      if (sessionId) {
        const { error } = await supabase.from("payments").insert({
          session_id: sessionId,
          user_id: user.id,
        });
        if (error) {
          navigate("/dashboard/sites");
        }
      }
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (user) {
      handleSuccessfulPayment();
    }
  }, [user, handleSuccessfulPayment]);

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
        Payment Successful!
      </Heading>
      <Text color={"gray.500"}>
        Head to your dashboard to get started building your brand new site.
      </Text>
    </Box>
  );
}
