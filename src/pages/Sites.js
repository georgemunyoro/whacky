import { AddIcon, ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { Box, Stack } from "@chakra-ui/layout";
import {
  Center,
  Spinner,
  Image,
  Avatar,
  SimpleGrid,
  Flex,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Textarea,
  useColorModeValue,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useStoreState } from "easy-peasy";
import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);

  const { onOpen, onClose, isOpen } = useDisclosure();

  const user = useStoreState((state) => state.user);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("templates")
      .select("id, name, thumbnail");
    setTemplates(data);
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
    fetchTemplates();
    fetchSites();
  }, [user]);

  if (loading) return <Loading width="100%" height="100%" />;

  return (
    <Box style={{ padding: "1rem", width: "100%" }}>
      <NewSiteForm
        templates={templates}
        isOpen={isOpen}
        onClose={onClose}
        fetchSites={fetchSites}
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
                      isDisabled={!site.published}
                      onClick={() =>
                        (window.location.href = `http://${
                          user?.user_metadata?.username
                        }.${BASE_URL.split("//").pop()}/${site.name}`)
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

const NewSiteForm = ({ isOpen, onClose, fetchSites, templates }) => {
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteDescription, setNewSiteDescription] = useState("");
  const [stage, setStage] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState();

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

    const { data, error } = await supabase.from("sites").insert([
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent style={{ width: "80vw", maxWidth: "80vw" }}>
        {stage == "details" && (
          <>
            <ModalHeader>Create a new site</ModalHeader>
            <ModalCloseButton />
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
        {stage == "templates" && (
          <>
            <ModalHeader>Pick a template</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid padding={5} columns={{ base: 2, md: 3 }} spacing={10}>
                {templates.map((t) => (
                  <Template
                    onClick={() => setSelectedTemplate(t.id)}
                    isSelected={selectedTemplate == t.id}
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
                  : `Continue with "${templates.filter((t) => t.id == selectedTemplate)[0]?.name}"`}
              </Button>
            </ModalFooter>
          </>
        )}
        {stage == "loading" && (
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
