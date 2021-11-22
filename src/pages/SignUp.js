import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { supabase } from "../supabase";
import { useStoreState } from "easy-peasy";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [errors, setErrors] = useState([]);

  const isLoggedIn = useStoreState((state) => state.isLoggedIn);
  //   if (isLoggedIn) router.push("/dashboard/sites");

  const handleSignup = async () => {
    if (password !== password2) {
      setErrors([...errors, "Passwords must match!"]);

      return;
    }

    const { user, session, error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        data: {
          name,
          username,
        },
      }
    );
    // router.push("/user/signup-successful");
  };

  return (
    <Flex
      minH={"100%"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
      style={{ flex: 1, alignSelf: "stretch" }}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Create your new account</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Fullname</FormLabel>
              <Input onChange={(e) => setName(e.target.value)} type="name" />
            </FormControl>
            <FormControl id="name" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                onChange={(e) => setUsername(e.target.value)}
                type="name"
              />
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input onChange={(e) => setEmail(e.target.value)} type="email" />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </FormControl>
            <FormControl id="confirm-password" isRequired>
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
              >
                <a href="/user/signin" color={"blue.400"}>
                  <Link color={"blue.400"}>Already have an account?</Link>
                </a>
              </Stack>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={handleSignup}
              >
                Sign up
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

export default SignUp;
