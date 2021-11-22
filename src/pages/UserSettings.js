import React, { useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  HStack,
  Avatar,
  AvatarBadge,
  IconButton,
  Center,
  Spinner,
  List,
  Text,
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { useStoreState } from "easy-peasy";
import { useNavigate } from "react-router";

export default function UserSettings() {
  const user = useStoreState((s) => s.user);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={12}
        justifyContent="center"
      >
        {/* <Stack direction={["row"]} spacing={6}>
          <Center>
            <Avatar
              size="xl"
              src="https://avatars.dicebear.com/api/identicon/user.svg"
            />
          </Center>
        </Stack> */}
        <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
          {user.user_metadata.username}
        </Heading>
        <List>
          <Text>{user.user_metadata.name}</Text>
          <Text>{user.email}</Text>
        </List>
        <Stack spacing={6} direction={["column", "row"]}>
          <Button
            bg={"red.400"}
            color={"white"}
            w="full"
            _hover={{
              bg: "red.500",
            }}
          >
            Cancel
          </Button>
          <Button
            bg={"blue.400"}
            color={"white"}
            w="full"
            _hover={{
              bg: "blue.500",
            }}
          >
            {isSaving && <Spinner />}
            {!isSaving && "Save"}
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
}
