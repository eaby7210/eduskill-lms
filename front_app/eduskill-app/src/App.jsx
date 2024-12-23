import Header from "./assets/Header";
import Footer from "./assets/Footer";
import appContext, { navigationReducer } from "./apis/Context";
import { useDispatch, useSelector } from "react-redux";
import { setUser, userNomad } from "./apis/redux/User/userSlice";
import { Outlet, useLoaderData } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import Toast from "./assets/components/Toast";
// import { useErrorHandler } from "./hooks/Hooks";

function App() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const data = useLoaderData();
  const [navigationState, navigationDispatch] = useReducer(navigationReducer, {
    state: "idle",
    message: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToast] = useState([]);

  const [appState, setState] = useState({ categories: data?.category });
  // const handleError = useErrorHandler();

  useEffect(() => {
    const initializeApp = () => {
      try {
        if (data?.user) {
          dispatch(setUser(data.user));
        } else {
          dispatch(userNomad());
        }
      } catch {
        addToast({
          type: "error",
          message: "Error while initializing app",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (user.initial === true) {
      initializeApp();
    }
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
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
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <Outlet />
          <Toast />
        </main>
        <Footer />
      </div>
    </appContext.Provider>
  );
}

export default App;
