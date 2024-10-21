import axios from "axios";
import store from "../redux/store";
import { userLogout } from "../redux/User/userSlice";
export const baseurl = "http://localhost:8000";
const apiClient = axios.create({
  baseURL: baseurl,
  headers: {
    "Content-Type": "application/json",
  },
});

// function getCsrfToken() {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; csrftoken=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
//   return null;
// }

// function setCsrfCookie() {
//   return axios.get("http://localhost:8000/csrf/", { withCredentials: true });
// }

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    // console.log(accessToken);
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
    return response;
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
        // console.log(refreshToken);
        const response = await axios.post(
          "http://localhost:8000/auth/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;

        localStorage.setItem("access_token", access);

        apiClient.defaults.headers["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
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
