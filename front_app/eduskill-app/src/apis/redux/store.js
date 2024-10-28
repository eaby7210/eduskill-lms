import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./User/userSlice";
import cartReducer from "./Cart/cartSlice";
import wishList from "./Wishlist/wishSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    wishList: wishList,
  },
});

export default store;
