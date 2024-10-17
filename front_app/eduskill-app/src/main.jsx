import "./index.css";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import store from "./apis/redux/store.js";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import router from "./apis/Routes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
