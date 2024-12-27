import axios from "axios";
import store from "../redux/store";
import { userLogout } from "../redux/User/userSlice";

const protocol = window.location.protocol === "https:" ? "https" : "http";
export const dn = import.meta.env.VITE_BASE_URL || "localhost:8000";
export const baseurl = `${protocol}://${dn}`;

export const wsUrl = `${protocol === "https" ? "wss" : "ws"}://${dn.replace(
  "/api",
  ""
)}`;
// export const wsUrl = `${"ws"}://${dn}`;
const apiClient = axios.create({
  baseURL: baseurl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    try {
      if (!response.headers["content-type"]?.includes("application/json")) {
        console.warn("Response is not JSON:", response);
        return Promise.reject(new Error("Expected JSON response from server.")); // Ensure response is valid JSON
      }
      return response;
    } catch (error) {
      console.error("Invalid JSON response:", error);
      return Promise.reject(new Error("Invalid JSON response from server."));
    }
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          store.dispatch(userLogout());
          return apiClient(originalRequest);
        }

        const response = await axios.post(`${baseurl}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;

        localStorage.setItem("access_token", access);

        apiClient.defaults.headers["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch {
        // console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        store.dispatch(userLogout());
        return null;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
