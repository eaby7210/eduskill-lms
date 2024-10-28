import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  wishList: [],
};

const wishSlice = createSlice({
  name: "whishList",
  initialState,
  reducers: {
    addItem(state, action) {
      state.wishList.push(action.payload);
    },
    removeItem(state, action) {
      state.wishList = state.wishList.filter(
        (item) => item.id !== action.payload.id
      );
    },
    clearWishList(state) {
      state.wishList = [];
    },
    setWishList(state, action) {
      state.wishList = action.payload.map((wish) => wish.course);
    },
  },
});

export const { addItem, removeItem, clearWishList, setWishList } =
  wishSlice.actions;

export default wishSlice.reducer;
