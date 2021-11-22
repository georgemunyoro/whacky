import Navbar from "./Navbar";
import Footer from "./Footer";
import { useStoreActions, useStoreState } from "easy-peasy";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useToast, Box, Spinner } from "@chakra-ui/react";
import { Navigate, useNavigate, useMatch } from "react-router";
import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import SignUpSuccessful from "../pages/SignUpSuccessful";
import ResetPassword from "../pages/ResetPassword";
import NewPassword from "../pages/NewPassword";
import Sites from "../pages/Sites";
import Editor from "../pages/Editor";
import SiteSettings from "../pages/SiteSettings";
import UserSettings from "../pages/UserSettings";
import Pricing from "../pages/Pricing";

export default function Layout({ children }) {
  const isEditorPage = useMatch("/dashboard/sites/editor/*");

  const setIsLoggedIn = useStoreActions((actions) => actions.setIsLoggedIn);
  const setSession = useStoreActions((actions) => actions.setSession);

  const isLoggedIn = useStoreState((state) => state.isLoggedIn);
  const isFooterVisible = useStoreState((state) => state.isFooterVisible);

  const setUser = useStoreActions((actions) => actions.setUser);

  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();


  useEffect(async () => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          toast({
            title: "Signed in",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          setIsLoggedIn(true);
          setSession(session);
          navigate("/dashboard/sites");
        } else if (event == "SIGNED_OUT") {
          setIsLoggedIn(false);
          setSession(null);
          navigate("/");

          toast({
            title: "Signed out",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
        }
      }
    );

    if (!isLoggedIn) {
      const user = await supabase.auth.user();
      if (user) {
        setIsLoggedIn(true);
        setUser(user);
      }
    }
    setLoading(false);

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  if (loading)
    return (
      <Box
        width="100%"
        height="100vh"
        justifyContent="center"
        alignItems="center"
        display="flex"
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Box>
    );

  if (isEditorPage) {
    return (
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            height: "83vh",
          }}
        >
          <Box style={{ height: "100%", display: "flex" }}>
            <Routes>
              <Route
                path="/dashboard/sites/editor/:siteId"
                element={<Editor />}
              />
            </Routes>
          </Box>
        </main>
      </span>
    );
  }

  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <main
        style={{
          flex: 1,
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          height: "83vh",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/pricing" element={<Pricing />} />
          <Route path="/user/signin" element={<SignIn />} />
          <Route path="/user/signup" element={<SignUp />} />
          <Route path="/user/reset-password" element={<ResetPassword />} />
          <Route path="/user/new-password" element={<NewPassword />} />
          {!isLoggedIn && (
            <Route path="*" element={<Navigate replace to="/user/signin" />} />
          )}
          {isLoggedIn && (
            <>
              <Route path="/dashboard/sites" element={<Sites />} />
              <Route
                path="/user/signup-successful"
                element={<SignUpSuccessful />}
              />
              <Route
                path="/dashboard/sites/editor/:siteId"
                element={<Editor />}
              />
              <Route
                path="/dashboard/sites/settings/:siteId"
                element={<SiteSettings />}
              />
              <Route path="/dashboard/billing" element={<Editor />} />
              <Route path="/dashboard/settings" element={<UserSettings />} />
            </>
          )}
        </Routes>
      </main>
      {isFooterVisible && <Footer />}
    </span>
  );
}
