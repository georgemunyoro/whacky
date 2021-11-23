import { Button, Box, Heading, List, Stack, Text } from "@chakra-ui/react";
import { useStoreState } from "easy-peasy";
import React, { useEffect, useRef, useState } from "react";
import Loading from "../components/Loading";
import { supabase } from "../supabase";

const PAYMENT_API_URL = "http://localhost:4242";

export default function UserSettings() {
  const user = useStoreState((s) => s.user);

  // eslint-disable-next-line
  const [payments, setPayments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  const billingFormRef = useRef();

  const openBillingSession = () => {
    billingFormRef.current.submit();
  };

  const fetchSubs = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("session_id, created_at, user_id");

    if (!error && data.length > 0) {
      setPayments(data);
      setSessionId(data.pop().session_id);
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line
  useEffect(async () => {
    fetchSubs();
  }, [user]);

  if (isLoading) return <Loading width="100%" height="100%" />;

  return (
    <Box style={{ padding: "5%" }}>
      <Heading
        margin={2}
        lineHeight={1.1}
        fontSize={{ base: "2xl", sm: "3xl" }}
      >
        {user.user_metadata.username}
      </Heading>
      <List margin={2}>
        <Text>{user.user_metadata.name}</Text>
        <Text>{user.email}</Text>
      </List>
      <form
        ref={billingFormRef}
        action={`${PAYMENT_API_URL}/create-portal-session`}
        method="POST"
      >
        <input
          type="hidden"
          id="session-id"
          name="session_id"
          value={sessionId}
        />
      </form>
      <Stack spacing={6} direction={["column", "row"]}>
        <Button
          margin={2}
          bg={"blue.400"}
          color={"white"}
          w="full"
          maxW={"500px"}
          _hover={{
            bg: "blue.500",
          }}
          onClick={openBillingSession}
          isDisabled={sessionId === ""}
        >
          Manage your billing information
        </Button>
      </Stack>
    </Box>
  );
}
