import Header from "./assets/Header";
import Footer from "./assets/Footer";
import appContext from "./apis/Context";
import { useDispatch } from "react-redux";
import { setUser } from "./apis/redux/User/userSlice";
import { Outlet, useLoaderData, useNavigation } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  const navigation = useNavigation;
  const isLoading = navigation.state === "loading";
  const data = useLoaderData();
  const dispatch = useDispatch();
  const [appState, setState] = useState({ categories: data.category });
  useEffect(() => {
    if (data.user) {
      dispatch(setUser(data.user));
    }
  }, [data.user, dispatch]);

  return (
    <>
      <appContext.Provider value={{ appState, setState }}>
        <Header />
        <main>
          {isLoading ? (
            <span className="loading loading-bars loading-lg"></span>
          ) : (
            <Outlet />
          )}
        </main>
        <Footer />
      </appContext.Provider>
    </>
  );
}

export default App;
