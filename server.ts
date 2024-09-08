const serverUrl =
  (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:8080";

export default serverUrl;
