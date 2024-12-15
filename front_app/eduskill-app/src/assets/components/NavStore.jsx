// import React from "react";

import { useSelector } from "react-redux";
import Cart from "../svgs/Cart";
import Heart from "../svgs/Heart";
import { NavLink } from "react-router-dom";
import Notifications from "./Notifications";

export default function NavStore() {
  const wishList = useSelector((state) => state.wishList).wishList;
  const cart = useSelector((state) => state.cart).cart;
  return (
    <>
      <NavLink to={"/user/cart"}>
        <Cart
          h={"h-7"}
          w={"w-7"}
          indicator={cart.length > 0}
          count={cart.length}
        />
      </NavLink>
      <NavLink to={"/user/wishlist"}>
        <Heart
          h={"h-7"}
          w={"w-7"}
          indicator={wishList.length > 0}
          count={wishList.length}
        />
      </NavLink>
      <Notifications />
    </>
  );
}
