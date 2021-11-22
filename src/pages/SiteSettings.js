import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Stack,
  Switch,
  Textarea,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { supabase } from "../supabase";
import { useParams, useNavigate } from "react-router-dom";

const SiteSettings = () => {
  const navigate = useNavigate();
  const params = useParams();
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [site, setSite] = useState();
  const [loading, setLoading] = useState(true);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  useEffect(async () => {
    fetchSite();
  }, [params]);

  const fetchSite = async () => {
    const { data } = await supabase
      .from("sites")
      .select(
        "created_at, id, name, description, published, html, css, js, owner"
      )
      .eq("id", params.siteId);

    if (data) {
      setSite(data[0]);
      setName(data[0].name);
      setDescription(data[0].description);
      setLoading(false);
      setIsPublished(data[0].published);
    }
  };

  const handleDeleteSite = async () => {
    setIsDeleteConfirmationOpen(false);
    setIsDeleting(true);
    await supabase.from("sites").delete().match({ id: site.id });
    navigate("/dashboard/sites");
  };
  const handleSaveSettings = async () => {
    setIsSaving(true);
    await supabase
      .from("sites")
      .update({
        published: isPublished,
        name,
        description,
      })
      .match({ id: params.siteId });

    if (isPublished) {
      if (site.published) {
        await supabase
          .from("published_sites")
          .update({
            name,
            description,
            html: site.html,
            css: site.css,
            js: site.js,
          })
          .match({ id: site.id });
      } else {
        await supabase.from("published_sites").insert({
          id: site.id,
          name: name,
          html: site.html,
          css: site.css,
          js: site.js,
          description: description,
          owner: site.owner,
        });
      }
    }

    if (!isPublished) {
      await supabase.from("published_sites").delete().match({ id: site.id });
    }

    fetchSite();

    setIsSaving(false);

    toast({
      title: "Site updated",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  if (loading) return <Loading width="100%" height="100%" />;

  return (
    <>
      <Modal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Are you sure you want to delete site "{site?.name}"?
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody fontWeight="bold">
            THIS ACTION IS COMPLETELY IRREVERSIBLE, AND ONCE DELETED, YOU WILL
            NOT BE ABLE TO GET YOUR SITE BACK!
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmationOpen(false)}
            >
              No, nevermind
            </Button>
            <Button colorScheme="red" mr={3} onClick={handleDeleteSite}>
              Yes, I am absolutely certain
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex width={"100%"} align={"center"} justify={"center"}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
            {name}
          </Heading>
          <FormControl id="siteName"></FormControl>
          <FormControl id="userName">
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Name"
              value={name}
              _placeholder={{ color: "gray.500" }}
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl id="description">
            <FormLabel>Description</FormLabel>
            <Textarea
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              value={description}
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="email-alerts" mb="0">
              Enable public viewing?
            </FormLabel>
            <Switch
              value={isPublished}
              isChecked={isPublished}
              onChange={(e) => {
                setIsPublished(!isPublished);
              }}
              id="public-viewing"
            />
          </FormControl>
          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              bg={"red.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "red.500",
              }}
              onClick={() => setIsDeleteConfirmationOpen(true)}
              disabled={isDeleting || isSaving}
            >
              {isDeleting && <Spinner />}
              {!isDeleting && "Delete"}
            </Button>
            <Button
              bg={"blue.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "blue.500",
              }}
              onClick={handleSaveSettings}
              disabled={isDeleting || isSaving}
            >
              {isSaving && <Spinner />}
              {!isSaving && (isPublished ? "Save & Publish" : "Save")}
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </>
  );
};

export default SiteSettings;
