import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Heading,
} from "@chakra-ui/react";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <Box
      width="100%"
      maxW="400px"
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      m="0 auto"
      mt={8}
      alignContent={"center"}
      textAlign={"center"}
      gap={"5px"}
      backgroundColor={"rgba(200,200,200)"}
      padding={30}
    >
      <Heading size="md" mb={20}>
        Admin Client
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={10} gap={30}>
          <FormControl isRequired display={"flex"} flexDir={"column"} gap={10}>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
            />
          </FormControl>
          <FormControl isRequired display={"flex"} flexDir={"column"} gap={10}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </FormControl>
          <Button
            type="submit"
            height={50}
            width={"100px"}
            margin={"0 auto"}
            colorScheme="blue"
            size="md"
          >
            Login
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default LoginPage;
