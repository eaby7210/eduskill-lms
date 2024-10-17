import { createSlice } from "@reduxjs/toolkit";
// import apiClient from "../../interceptors/axios";

const initialUser = {
  email: "",
  pk: null,
  username: "",
  isLoading: false,
  image: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUser,
  reducers: {
    setUser(state, action) {
      return { ...state, ...action.payload, isLoading: false };
    },
    userLogout() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return initialUser;
    },
    setLoading(state) {
      return {
        ...state,
        isLoading: true,
      };
    },
  },
});

export const {
  setUser,
  userLogout,
  userLogin,
  setLoading,
  // setProfile
} = userSlice.actions;
export default userSlice.reducer;
