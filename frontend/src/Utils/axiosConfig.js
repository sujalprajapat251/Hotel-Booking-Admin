import axios from "axios";
import { BASE_URL } from "./baseUrl";

let csrfToken = null;

export const getCsrfToken = async () => {
  const res = await axios.get(`${BASE_URL}/csrf-token`, {
    withCredentials: true,
  });
  csrfToken = res.data.csrfToken;
  return csrfToken;
};

axios.interceptors.request.use(async (config) => {
  if (!csrfToken && ["post", "put", "delete", "patch"].includes(config.method)) {
    await getCsrfToken();
  }

  if (csrfToken) {
    config.headers["x-csrf-token"] = csrfToken;
  }

  config.withCredentials = true;
  return config;
});
