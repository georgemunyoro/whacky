import {
  AddIcon,
  ExternalLinkIcon,
  LockIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import { Box, Stack } from "@chakra-ui/layout";
import {
  Button,
  ButtonGroup,
  Center,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useStoreState } from "easy-peasy";
import React, { useEffect, useRef, useState } from "react";
import { MdWeb } from "react-icons/md";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { supabase } from "../supabase";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const PAYMENT_API_URL = process.env.REACT_APP_PAYMENTS_API_URL;
const SUBSCRIPTION_PRICE_KEY = process.env.REACT_APP_PRICE_KEY

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [username, setUsername] = useState();

  const { onOpen, onClose, isOpen } = useDisclosure();

  const user = useStoreState((state) => state.user);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("templates")
      .select("id, name, thumbnail");
    setTemplates(data);
  };

  const fetchSubs = async () => {
    const { data } = await supabase.from("subscriptions").select("id, user_id");
    setPayments(data);
  };

  const fetchSites = async () => {
    const { data } = await supabase
      .from("sites")
      .select("created_at, name, id, published");
    if (data) {
      setSites(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata.username);
    }
    fetchTemplates();
    fetchSites();
    fetchSubs();
  }, [user]);

  if (loading) return <Loading width="100%" height="100%" />;

  return (
    <Box style={{ padding: "1rem", width: "100%" }}>
      <NewSiteForm
        templates={templates}
        isOpen={isOpen}
        onClose={onClose}
        fetchSites={fetchSites}
        hasAvailableSubscriptions={sites.length < payments.length}
      />
      <Heading margin={5}>Sites</Heading>
      <Box>
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Date Created</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {sites.map((site) => (
              <Tr key={site.id}>
                <Td>{site.name}</Td>
                <Td>{new Date(site.created_at).toLocaleDateString()}</Td>
                <Td textAlign="end">
                  <ButtonGroup>
                    <Link to={`/dashboard/sites/editor/${site.id}`}>
                      <Button>Edit</Button>
                    </Link>
                    <IconButton
                      isDisabled={!site.published || username == null}
                      onClick={() =>
                        window.open(
                          `http://${username}.${BASE_URL.split("//").pop()}/${
                            site.name
                          }`
                        )
                      }
                      icon={<ExternalLinkIcon />}
                      colorScheme="yellow"
                    />
                    <Link to={`/dashboard/sites/settings/${site.id}`}>
                      <IconButton icon={<SettingsIcon />} colorScheme="blue" />
                    </Link>
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
            <Tr>
              <Td></Td>
              <Td style={{ color: "#999" }}>
                You have {payments.length - sites.length} paid subscription(s)
                remaining.
              </Td>
            </Tr>
            <Tr>
              <Td>
                <Button
                  onClick={onOpen}
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                >
                  New Site
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

const NewSiteForm = ({
  isOpen,
  onClose,
  fetchSites,
  templates,
  hasAvailableSubscriptions,
}) => {
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteDescription, setNewSiteDescription] = useState("");
  const [stage, setStage] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState();
  const [isAwaitingCheckout, setIsAwaitingCheckout] = useState(false);

  const subscriptionFormRef = useRef();

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toast = useToast();
  const user = useStoreState((state) => state.user);

  const resetForm = () => {
    setNewSiteName("");
    setNewSiteDescription("");
    setStage("details");
    setSelectedTemplate(null);
  };

  const moveToTemplatesStage = () => {
    const re = /^[a-zA-Z0-9-]*$/;
    if (!re.test(newSiteName)) {
      toast({
        title: "Name must contain only letters, digits and dashes, no spaces",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (newSiteName.length < 3 || newSiteDescription.length < 3) {
      toast({
        title: "Name and description must be greater than 3 characters",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setStage("templates");
  };

  const createNewSite = async () => {
    setStage("loading");
    const response = await supabase
      .from("templates")
      .select("data")
      .match({ id: selectedTemplate });

    if (response.error) {
      toast({
        title: "An unexpected error ocurred, please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    const { error } = await supabase.from("sites").insert([
      {
        owner: user.id,
        name: newSiteName,
        description: newSiteDescription,
        editor_data: response.data[0].data,
      },
    ]);

    if (error) {
      toast({
        title: "Failed to create site",
        status: "error",
        isClosable: true,
      });
    } else {
      fetchSites();
      handleClose();
      toast({
        title: "Site created",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const checkout = async () => {
    setIsAwaitingCheckout(true);
    console.log(supabase);
    const res = await fetch(`${PAYMENT_API_URL}/create-checkout-session`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lookup_key: SUBSCRIPTION_PRICE_KEY,
        user: supabase.auth.user(),
      }),
    });
    const { checkoutUrl } = await res.json();
    window.location.href = checkoutUrl;
  };

  if (!hasAvailableSubscriptions)
    return (
      <Modal isCentered isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent style={{ maxWidth: "60vw" }}>
          <ModalHeader style={modalHeaderStyle}>
            You don't have enough subscriptions to create a new site
          </ModalHeader>
          <ModalBody>
            <section>
              <div className="product">
                <Box
                  w={"full"}
                  rounded={"md"}
                  p={6}
                  overflow={"hidden"}
                  display="flex"
                  border="3px solid #eee"
                  boxShadow={"md"}
                >
                  <Box h={"15px"} />
                  <MdWeb size={30} style={{ marginRight: 10 }} />
                  <Stack>
                    <Text fontFamily={"body"} fontWeight="bold" color="#333">
                      Premium plan
                    </Text>
                    <Text
                      margin={0}
                      fontFamily={"body"}
                      fontWeight="bold"
                      color="#999"
                    >
                      $20 / year
                    </Text>
                  </Stack>
                </Box>
              </div>
              <form
                ref={subscriptionFormRef}
                action={`${PAYMENT_API_URL}/create-checkout-session`}
                method="POST"
              >
                {/* Add a hidden field with the lookup_key of your Price */}
                <input
                  type="hidden"
                  name="lookup_key"
                  value="price_iMvskhNyytU8BkqK"
                />
                {/* <button id="checkout-and-portal-button" type="submit">
                  Checkout
                </button> */}
              </form>
            </section>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose} margin={5}>
              Close
            </Button>
            <Button
              onClick={checkout}
              leftIcon={<LockIcon />}
              colorScheme="blue"
              mr={3}
              isDisabled={isAwaitingCheckout}
            >
              {isAwaitingCheckout ? <Spinner /> : "Checkout"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );

  return (
    <Modal
      isCentered={stage !== "templates"}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalOverlay />
      <ModalContent style={{ width: "80vw", maxWidth: "80vw" }}>
        {stage === "details" && (
          <>
            <ModalHeader style={modalHeaderStyle}>
              Create a new site
            </ModalHeader>
            <ModalBody>
              <Stack spacing={4}>
                <FormControl id="name">
                  <FormLabel>Name</FormLabel>
                  <Input onChange={(e) => setNewSiteName(e.target.value)} />
                </FormControl>
                <FormControl id="description">
                  <FormLabel>Desciption</FormLabel>
                  <Textarea
                    onChange={(e) => setNewSiteDescription(e.target.value)}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handleClose} margin={5}>
                Close
              </Button>
              <Button colorScheme="blue" mr={3} onClick={moveToTemplatesStage}>
                Pick a template
              </Button>
            </ModalFooter>
          </>
        )}
        {stage === "templates" && (
          <>
            <ModalHeader style={modalHeaderStyle}>Pick a template</ModalHeader>
            <ModalBody>
              <SimpleGrid padding={5} columns={{ base: 2, md: 3 }} spacing={10}>
                {templates.map((t) => (
                  <Template
                    onClick={() => setSelectedTemplate(t.id)}
                    isSelected={selectedTemplate === t.id}
                    key={t.id}
                    name={t.name}
                    img={t.thumbnail}
                  />
                ))}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handleClose} margin={5}>
                Close
              </Button>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={createNewSite}
                isDisabled={selectedTemplate == null}
              >
                {selectedTemplate == null
                  ? "Continue"
                  : `Continue with "${
                      templates.filter((t) => t.id === selectedTemplate)[0]
                        ?.name
                    }"`}
              </Button>
            </ModalFooter>
          </>
        )}
        {stage === "loading" && (
          <ModalContent
            style={{
              width: "80vw",
              maxWidth: "80vw",
              height: "80vh",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </ModalContent>
        )}
      </ModalContent>
    </Modal>
  );
};

const Template = ({ name, img, onClick, isSelected }) => {
  return (
    <Center onClick={onClick} py={6}>
      <Box
        w={"full"}
        bg={useColorModeValue("white", "gray.900")}
        border={isSelected ? "3px solid skyblue" : "1px solid #ccc"}
        rounded={"md"}
        p={6}
        overflow={"hidden"}
      >
        <Box
          h={"150px"}
          bg={"gray.100"}
          mt={-6}
          mx={-6}
          mb={6}
          pos={"relative"}
          backgroundImage={img}
          style={{
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <Stack>
          <Text
            color={useColorModeValue("gray.700", "white")}
            fontFamily={"body"}
          >
            {name}
          </Text>
        </Stack>
      </Box>
    </Center>
  );
};

export default Sites;

const modalHeaderStyle = {
  background: "black",
  color: "white",
  marginBottom: "2rem",
  borderRadius: "5px 5px 0 0",
  textAlign: "center",
};
