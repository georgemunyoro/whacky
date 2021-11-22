import { useStoreState } from "easy-peasy";
import Logo from "./Logo";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import { supabase } from "../supabase";

const NAV_LINKS = [
  {
    label: "Sites",
    href: "/dashboard/sites",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
];

const NavLink = ({ children, to }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    to={to}
  >
    {children}
  </Link>
);

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isLoggedIn = useStoreState((state) => state.isLoggedIn);
  const user = useStoreState((s) => s.user);

  const navigate = useNavigate();

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.500")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <Logo />
            </Box>
            {isLoggedIn && (
              <HStack
                as={"nav"}
                spacing={4}
                display={{ base: "none", md: "flex" }}
              >
                {NAV_LINKS.map((link) => (
                  <NavLink to={link.href} key={link.label}>
                    {link.label}
                  </NavLink>
                ))}
              </HStack>
            )}
          </HStack>
          <Flex alignItems={"center"}>
            {!isLoggedIn && (
              <>
                <Button
                  variant={"solid"}
                  size={"sm"}
                  mr={4}
                  onClick={() => navigate("/user/signin")}
                >
                  Sign in
                </Button>
                <Button
                  variant={"solid"}
                  colorScheme={"teal"}
                  size={"sm"}
                  mr={4}
                  onClick={() => navigate("/user/signup")}
                >
                  Sign up
                </Button>
              </>
            )}
            {isLoggedIn && (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={`https://avatars.dicebear.com/api/identicon/${user?.id}.svg`}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => navigate("/dashboard/settings")}>
                    Settings
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {isLoggedIn &&
                NAV_LINKS.map((link) => (
                  <NavLink to={link.href} key={link.label}>
                    {link.label}
                  </NavLink>
                ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}

const NAV_ITEMS = [];
