/* eslint-disable react/prop-types */
// import React from "react";

import { Link } from "react-router-dom";
import Cart from "../svgs/Cart";
import Heart from "../svgs/Heart";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem, removeCartItem } from "../../apis/redux/Cart/cartSlice";
import { addItem, removeItem } from "../../apis/redux/Wishlist/wishSlice";
import { useContext, useEffect, useState } from "react";
import { postCartItem, postWishItem } from "../../apis/services/apiUser";
import appContext from "../../apis/Context";

export default function CourseCard({ item }) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { addToast } = useContext(appContext);
  const wishList = useSelector((state) => state.wishList).wishList;
  const cart = useSelector((state) => state.cart).cart;
  const [isCartItem, setCartItem] = useState(false);
  const [isWishItem, setWishList] = useState(false);
  useEffect(() => {
    setCartItem(cart.some((cItem) => cItem.id === item.id));
    setWishList(wishList.some((wItem) => wItem.id === item.id));
  }, [cart, wishList, item.id]);

  async function handleCartItem() {
    try {
      await postCartItem(item.id);

      if (isCartItem) {
        dispatch(removeCartItem(item));
        setCartItem(false);
      } else {
        dispatch(addCartItem(item));
        setCartItem(true);
      }
    } catch (error) {
      alert(`Error: ${error.messsage}`);
    }
  }

  async function handleWishItem() {
    try {
      await postWishItem(item.id);
      if (isWishItem) {
        dispatch(removeItem(item));
        setWishList(false);
        addToast({
          type: "info",
          messsage: "Item Removed from cart",
        });
      } else {
        dispatch(addItem(item));
        setWishList(true);
        addToast({
          type: "info",
          messsage: "Item added from cart",
        });
      }
    } catch (error) {
      alert(`Error: ${error.messsage}`);
    }
  }

  return (
    <>
      <div className="card lg:card-side bg-base-300 shadow-xl">
        <Link to={`/courses/${item.slug}`} className="lg:w-1/3">
          <figure className="p-1 h-full">
            <img
              src={
                item.course_thumbnail
                  ? item.course_thumbnail
                  : "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
              }
              alt={item.title}
              className="xl:h-4/6  lg:h-full md:h-52 h-52 object-cover"
            />
          </figure>
        </Link>
        <div className="card-body lg:w-2/3">
          <Link to={`/courses/${item.slug}`}>
            <h2 className="card-title text-3xl font-bold mb-2">{item.title}</h2>

            <p className="text-lg">{item.description}</p>
          </Link>
          <p className="text-lg font-semibold">
            Duration: {item.duration} hours
          </p>
          <p className="text-lg">
            Price: ₹{item?.affected_price}{" "}
            {item.discount_percent && (
              <span className="line-through text-red-500">₹{item.price}</span>
            )}
          </p>
          <p className="text-sm text-gray-500">By: {item.teacher_name}</p>
          <div className="card-actions justify-end">
            <Link to={`/courses/${item.slug}`} className="btn btn-primary">
              View Course
            </Link>
            {user?.pk && (
              <>
                <a className="btn btn-ghost" onClick={() => handleWishItem()}>
                  <Heart h={"h-8"} w={"w-8"} indicator={isWishItem} />
                </a>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleCartItem()}
                >
                  <Cart h={"h-8"} w={"w-8"} indicator={isCartItem} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
