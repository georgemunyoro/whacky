import { Button, Flex, Heading, List, Stack, Text } from "@chakra-ui/react";
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

    if (!error) {
      setPayments(data);
      setSessionId(data.pop().session_id);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, [user]);

  if (isLoading) return <Loading width="100%" height="100%" />;

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"gray.50"}>
      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={12}
        justifyContent="center"
      >
        <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
          {user.user_metadata.username}
        </Heading>
        <List>
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
            bg={"blue.400"}
            color={"white"}
            w="full"
            _hover={{
              bg: "blue.500",
            }}
            onClick={openBillingSession}
          >
            Manage your billing information
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
}
