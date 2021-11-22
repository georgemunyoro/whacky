import { Box, IconButton, useToast } from "@chakra-ui/react";
import grapesjs from "grapesjs";
import "grapesjs-preset-webpage";
import "grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css";
import "grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js";
import "grapesjs/dist/css/grapes.min.css";
import "grapesjs/dist/grapes.min.js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Loading from "../components/Loading";
import { supabase } from "../supabase";

import "./Editor.css";

const Editor = () => {
  const params = useParams();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);

  const uploadToServer = async ({ html, css, js, editor_data }) => {
    const { data, error } = await supabase
      .from("sites")
      .update({
        html,
        css,
        js,
        editor_data,
      })
      .match({ id: params.siteId });
    if (!error) {
      toast({
        title: "Saved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  useEffect(async () => {
    const { data } = await supabase
      .from("sites")
      .select("created_at, editor_data, html, css, js, id, name")
      .eq("id", params.siteId);

    const editor = grapesjs.init({
      container: "#gjs",
      plugins: ["gjs-preset-webpage"],
      storageManager: {
        type: null,
        autosave: false,
        autoload: false,
      },
    });

    if (data[0]) {
      editor.loadData(JSON.parse(data[0].editor_data));
    } else {
      return;
    }

    editor.Commands.add("upload", (editor) => {
      uploadToServer({
        html: editor.getHtml(),
        css: editor.getCss(),
        js: editor.getJs(),
        editor_data: JSON.stringify(editor.storeData()),
      });
    });

    editor.Panels.addButton("options", [
      {
        id: "save",
        className: "fa fa-floppy-o icon-blank",
        command: () => editor.runCommand("upload"),
        attributes: { title: "Save" },
      },
    ]);

    setIsLoading(false);
  });

  if (isLoading) return <Loading height="100%" width="100%" />;

  return (
    <>
      <Box width="100%" style={{ display: "flex" }}>
        <div id="gjs"></div>
      </Box>
    </>
  );
};

const EditorCustomControlButton = ({ icon, onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      style={{
        background: "none",
        borderRadius: 0,
        borderBottom: "1px solid silver",
      }}
      icon={icon}
    />
  );
};

export default Editor;
