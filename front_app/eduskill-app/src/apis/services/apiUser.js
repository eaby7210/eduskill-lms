import apiClient from "../interceptors/axios";
import { setCart } from "../redux/Cart/cartSlice";
import store from "../redux/store";
import { setWishList } from "../redux/Wishlist/wishSlice";

async function getCart() {
  try {
    const res = await apiClient.get("/user/cart/");
    console.log(res);
    if (res.status >= 200 && res.status < 300) {
      store.dispatch(setCart(res.data));
    }
  } catch (error) {
    console.log(error);
    throw new Error(`Error in Fetching Cart: ${error.message}`);
  }
}

async function getWishList() {
  try {
    const res = await apiClient.get("/user/wishlist/");

    if (res.status >= 200 && res.status < 300) {
      store.dispatch(setWishList(res.data));
    }
  } catch (error) {
    console.log(error);
    throw new Error(`Error in Fetching Whishlist: ${error.message} `);
  }
}

export async function getUser() {
  try {
    const res = await apiClient.get("/auth/user/");
    if (res.status >= 200 && res.status < 300) {
      getCart();
      getWishList();
    }
    return res.data;
  } catch {
    return null;
  }
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
    // console.log(res);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.response.status, res: error.response.data };
  }
}

export async function userLogOutApi() {
  try {
    const res = await apiClient.post("/auth/logout/");
    console.log(res);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.response.status, res: error.response.data };
  }
}

export async function Categorylist() {
  try {
    const res = await apiClient.get("/category/");
    // console.log(res);

    return res.data;
  } catch (error) {
    const er = error.response.data ? error.response.data : "Error Occured";
    throw er;
    // return { status: error.response.status, res: error.response.data };
  }
}

export async function InitialLoad() {
  const category = await Categorylist();
  const user = await getUser();
  const res = { category, user };
  return res;
}
export async function postCartItem(id) {
  const res = await apiClient.post("/user/cart/", { course: id });
  console.log(res);
}

export async function postWishItem(id) {
  await apiClient.post("user/wishlist/", { course: id });
}
