/* eslint-disable react-hooks/exhaustive-deps */
import Header from "./assets/Header";
import Footer from "./assets/Footer";
import appContext, { navigationReducer } from "./apis/Context";
import { useDispatch } from "react-redux";
import { setUser, userNomad } from "./apis/redux/User/userSlice";
import { Outlet, useLoaderData } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import Toast from "./assets/components/Toast";

function App() {
  const dispatch = useDispatch();
  const data = useLoaderData();
  const [navigationState, navigationDispatch] = useReducer(navigationReducer, {
    state: "idle",
    message: null,
  });
  const [toasts, setToast] = useState([]);

  const [appState, setState] = useState({ categories: data?.category });

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    } else {
      dispatch(userNomad());
      addToast({
        type: "error",
        message: `Error while getting Category`,
      });
    }
  }, [data.user, dispatch]);
  function removeToast(id) {
    setToast((toasts) => toasts.filter((toast) => toast.id != id));
  }
  function addToast(data, time = 6000) {
    const id =
      Date.now() + ((Math.floor(Math.random() * 1000) * Date.now()) % 10000);
    const existingToastIndex = toasts.findIndex(
      (toast) => toast.type === data.type && toast.message === data.message
    );

    if (existingToastIndex !== -1) {
      removeToast(toasts[existingToastIndex].id);
    }
    setToast((toasts) => [...toasts, { id: id, ...data }]);
    setTimeout(() => {
      removeToast(id);
    }, time);
  }

  return (
    <div className="h-dvh">
      <appContext.Provider
        value={{
          appState,
          setState,
          toasts,
          addToast,
          removeToast,
          navigationState,
          navigationDispatch,
        }}
      >
        <Header />

        <main>
          <Outlet />
        </main>
        <Footer />
        <Toast />
      </appContext.Provider>
    </div>
  );
}

export default App;
