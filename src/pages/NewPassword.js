import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabase";

function NewPassword() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshToken = localStorage.getItem("refresh_token");

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("refresh_token") == null) {
      navigate("/");
    }
    setLoading(false);
    localStorage.removeItem("refresh_token");
  }, [navigate]);

  const handleSignup = async () => {
    if (password !== password2) {
      setErrors([...errors, "Passwords must match!"]);
      return;
    }

    await supabase.auth.signIn({
      refreshToken,
    });

    await supabase.auth.update({
      password,
    });
  };

  return (
    loading && (
      <Flex
        minH={"100%"}
        align={"center"}
        justify={"center"}
        // bg={useColorModeValue("gray.50", "gray.800")}
        style={{ flex: 1, alignSelf: "stretch" }}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Set a new password</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            // bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack spacing={4}>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
              </FormControl>
              <FormControl id="confirm-password">
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  onChange={(e) => setPassword2(e.target.value)}
                  type="password"
                />
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"center"}
                  justify={"space-between"}
                ></Stack>
                <Button
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={handleSignup}
                >
                  Set new password
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    )
  );
}

export default NewPassword;
