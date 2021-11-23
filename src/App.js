import { ChakraProvider } from "@chakra-ui/react";
import { StoreProvider } from "easy-peasy";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";

import store from "./store";
import { supabase } from "./supabase";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function App() {
  const isSite = window.location.host != BASE_URL.split("//").pop();

  const [siteCompleteHtml, setSiteCompleteHtml] = useState("");

  useEffect(async () => {
    if (isSite) {
      const siteName = window.location.pathname.split("/")[1];
      const username = window.location.host.split(".")[0];
      const { data } = await supabase
        .from("published_sites")
        .select("html, css, js, name")
        .match({ name: siteName, owner_username: username });

      if (!data || data.length == 0) {
        window.location.href = BASE_URL;
        return;
      }

      const { html, css, js } = data[0];
      console.log(data);
      setSiteCompleteHtml(`<style>${css}</style>${html}<script>${js}</script>`);
    }
  });

  if (isSite)
    return <span dangerouslySetInnerHTML={{ __html: siteCompleteHtml }}></span>;

  return (
    <ChakraProvider>
      <StoreProvider store={store}>
        <Layout />
      </StoreProvider>
    </ChakraProvider>
  );
}

export default App;
