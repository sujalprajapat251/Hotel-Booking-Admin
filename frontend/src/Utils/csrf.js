import axios from "axios";
import { BASE_URL } from "./baseUrl";

export const getCsrfToken = async () => {
  const res = await axios.get(`${BASE_URL}/csrf-token`, {
    withCredentials: true,
  });

  return res.data.csrfToken;
};
