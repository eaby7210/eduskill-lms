import apiClient from "../interceptors/axios";
import { setCart } from "../redux/Cart/cartSlice";
import store from "../redux/store";
import { setWishList } from "../redux/Wishlist/wishSlice";

async function getCart() {
  const res = await apiClient.get("/user/cart/");
  if (res.status >= 200 && res.status < 300) {
    store.dispatch(setCart(res.data));
  }
}

async function getWishList() {
  const res = await apiClient.get("/user/wishlist/");

  if (res.status >= 200 && res.status < 300) {
    store.dispatch(setWishList(res.data));
  }
}

export async function getUser() {
  const res = await apiClient.get("/auth/user/");
  if (res.status >= 200 && res.status < 300) {
    getCart();
    getWishList();
    await Promise.allSettled([getCart(), getWishList()]);
  }
  return res.data;
}

export async function userLoginApi(data) {
  try {
    const res = await apiClient.post("/auth/login/", data);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.status, res: error.response.data };
  }
}

export async function userSignupApi(data) {
  try {
    const res = await apiClient.post("/auth/register/", data);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.response.status, res: error.response.data };
  }
}

export async function userLogOutApi() {
  try {
    const res = await apiClient.post("/auth/logout/");
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.response.status, res: error.response.data };
  }
}

export async function Categorylist() {
  const res = await apiClient.get("/category/");

  return res.data;
}

export async function InitialLoad() {
  const [userResult, categoryResult] = await Promise.allSettled([
    getUser(),
    Categorylist(),
  ]);
  return {
    user: userResult.status === "fulfilled" ? userResult.value : null,
    category: categoryResult.status === "fulfilled" ? categoryResult.value : [],
  };
}

export async function postCartItem(id) {
  const res = await apiClient.post("/user/cart/", { course: id });
  return res.data;
}

export async function postWishItem(id) {
  const res = await apiClient.post("user/wishlist/", { course: id });
  return res.data;
}
