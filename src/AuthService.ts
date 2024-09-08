import { User } from "./App";

interface authUser {
  username: string;
  passwordHash: string;
  isAdmin: boolean;
}

const users: authUser[] = [
  {
    username: "admin",
    passwordHash:
      (import.meta.env.VITE_ADMIN_PASSWORD as string) ||
      "default_admin_password",
    isAdmin: true,
  },
  {
    username: "test",
    passwordHash:
      (import.meta.env.VITE_TEST_PASSWORD as string) || "default_test_password",
    isAdmin: false,
  },
];

export const login = (username: string, password: string): User => {
  console.warn(import.meta.env.VITE_ADMIN_PASSWORD);
  console.warn(import.meta.env.VITE_TEST_PASSWORD);
  console.warn(import.meta.env.VITE_SERVER_URL);
  const user = users.find((u) => u.username === username);
  if (!user) throw new Error("User not found");

  if (password !== user.passwordHash) throw new Error("Invalid password");

  const token = btoa(
    JSON.stringify({
      username,
      isAdmin: user.isAdmin,
      exp: Date.now() + 3600000,
    })
  );
  localStorage.setItem("token", token);

  return { username, isAdmin: user.isAdmin };
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token)) as {
      exp: number;
      username: string;
      isAdmin: boolean;
    };
    if (decoded.exp < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return { username: decoded.username, isAdmin: decoded.isAdmin };
  } catch {
    return null;
  }
};

export const refreshToken = () => {
  const user = getUser();
  if (!user) throw new Error("No user found");

  const token = btoa(JSON.stringify({ ...user, exp: Date.now() + 3600000 }));
  localStorage.setItem("token", token);
  return user;
};
