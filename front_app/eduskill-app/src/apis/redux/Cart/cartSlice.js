import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addCartItem(state, action) {
      state.cart.push(action.payload);
    },
    removeCartItem(state, action) {
      state.cart = state.cart.filter((item) => item.id !== action.payload.id);
    },
    clearCart(state) {
      state.cart = [];
    },
    setCart(state, action) {
      state.cart = action.payload.map((item) => item.course);
    },
  },
});

export const { addCartItem, setCart, removeCartItem, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
