import axios from "axios";
import { BASE_URL } from "./baseUrl";

let csrfToken = null;

export const getCsrfToken = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/csrf-token`, { withCredentials: true });
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Could not fetch CSRF token", error);
  }
};

// Automatically attaches the CSRF token to the headers
axios.interceptors.request.use(async (config) => {
  if (config.url.includes('/csrf-token')) {
    return config;
  }

  const isMutation = ["post", "put", "delete", "patch"].includes(config.method?.toLowerCase());

  if (isMutation) {
    if (!csrfToken) {
      await getCsrfToken();
    }
    config.headers["x-csrf-token"] = csrfToken;
  }

  config.withCredentials = true;
  return config;
});

// If the backend returns 403 , CSRF token expired.
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await getCsrfToken();
      if (newToken) {
        originalRequest.headers["x-csrf-token"] = newToken;
        return axios(originalRequest); 
      }
    }
    return Promise.reject(error);
  }
);