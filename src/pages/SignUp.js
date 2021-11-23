import {
  Flex,
  Spinner,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  useToast,
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
import { useNavigate } from "react-router";

function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = useStoreState((state) => state.isLoggedIn);

  const toast = useToast();

  const handleSignup = async () => {
    setIsLoading(true);
    let errors = [];
    if (password !== password2) {
      errors.push("Passwords must match");
    }

    if (username.length < 3) {
      errors.push("Username should be more than 3 characters");
    }

    if (name.length < 2) {
      errors.push("Please enter your full name");
    }

    if (errors.length > 0) {
      errors.forEach((e) => {
        toast({
          title: e,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        data: {
          fullname: name,
          username,
          subscription_count: 0,
        },
      }
    );

    if (error) {
      if (error.status == 500) {
        toast({
          title: "That username is unavailable",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      navigate("/user/signup-successful");
    }

    setIsLoading(false);
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
                {isLoading && <Spinner />}
                {!isLoading && "Sign up"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

export default SignUp;
