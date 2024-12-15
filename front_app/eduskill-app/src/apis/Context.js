import { createContext } from "react";

const appContext = createContext();
export const navigationReducer = (state, action) => {
  switch (action.type) {
    case "IDLE":
      return {
        state: "idle",
        message: action.payload?.message || null,
        progress: action.payload?.progress || 0,
      };
    case "LOADING":
      return {
        state: "loading",
        message: action.payload?.message || null,
        progress: action.payload?.progress || 0,
      };
    case "SUBMITTING":
      return {
        state: "submitting",
        message: action.payload?.message || null,
        progress: action.payload?.progress || 0,
      };
    case "ERROR":
      return {
        state: "error",
        message: action.payload?.message || "An error occurred",
        progress: 0,
      };
    default:
      return state;
  }
};

export default appContext;
