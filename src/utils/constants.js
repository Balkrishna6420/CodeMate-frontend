export const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : location.hostname.includes("vercel.app")
    ? "https://codemate-backend-hawh.onrender.com"
    : "/api";