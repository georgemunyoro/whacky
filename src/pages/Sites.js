import { AddIcon, ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { Box, Stack } from "@chakra-ui/layout";
import {
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

  const { onOpen, onClose, isOpen } = useDisclosure();

  const user = useStoreState((state) => state.user);

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
    fetchSites();
  }, [user]);

  if (loading) return <Loading width="100%" height="100%" />;

  return (
    <Box style={{ padding: "1rem", width: "100%" }}>
      <NewSiteForm isOpen={isOpen} onClose={onClose} fetchSites={fetchSites} />
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

const NewSiteForm = ({ isOpen, onClose, fetchSites }) => {
  const [newSiteName, setNewSiteName] = useState();
  const [newSiteDescription, setNewSiteDescription] = useState();

  const toast = useToast();

  const user = useStoreState((state) => state.user);

  const createNewSite = async () => {
    const { data, error } = await supabase.from("sites").insert([
      {
        owner: user.id,
        name: newSiteName,
        description: newSiteDescription,
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
      onClose();
      toast({
        title: "Site created",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
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
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue" mr={3} onClick={createNewSite}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Sites;
