import { useState, useEffect } from "react";
import {
  ChakraProvider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import Images from "./Images";
import Commands from "./Commands";
import ImageGeneration from "./ImageGeneration";
import PromptData from "./PromptData";
import Login from "./Login";
import { login, logout, getUser, refreshToken } from "./AuthService";

export interface User {
  username: string;
  isAdmin: boolean;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser: User | null = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(() => {
        try {
          const refreshedUser: User | null = refreshToken();
          setUser(refreshedUser);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          handleLogout();
        }
      }, 15 * 60 * 1000); // Refresh every 15 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const handleLogin = (username: string, password: string) => {
    try {
      const loggedInUser: User | null = login(username, password);
      setUser(loggedInUser);
    } catch (error) {
      console.log("Login failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ChakraProvider>
      <Tabs marginInline={"15px"} size={"lg"}>
        {/* {user && <Button onClick={handleLogout}>Logout</Button>} */}
        <TabList>
          <Tab>Images</Tab>
          <Tab>Prompt Data</Tab>
          <Tab>Commands</Tab>
          <Tab>Image Generation</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Images />
          </TabPanel>
          <TabPanel>
            <PromptData />
          </TabPanel>
          <TabPanel>
            <Commands />
          </TabPanel>
          <TabPanel>
            <ImageGeneration />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
};

export default App;
