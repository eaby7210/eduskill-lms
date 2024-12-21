/* eslint-disable react/prop-types */
// import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { postWishItem } from "../apis/services/apiUser";
import { removeItem } from "../apis/redux/Wishlist/wishSlice";

// WishlistCard Component
function WishlistCard({ wishlistItem }) {
  const dispatch = useDispatch();

  async function handleWishListItem() {
    try {
      await postWishItem(wishlistItem.id);
      dispatch(removeItem(wishlistItem));
    } catch {
      alert("Unable to remove from Wishlist");
    }
  }

  return (
    <div className="col-span-2">
      <div className="card bg-base-100 shadow-lg mb-4">
        <div className="card-body">
          {/* Course Title */}
          <h2 className="card-title text-primary">{wishlistItem.title}</h2>

          {/* Instructor and Category */}
          <p className="text-sm text-base-content mb-2">
            Instructor: {wishlistItem.teacher_name}
          </p>
          <p className="text-sm text-base-content mb-4">
            Category: {wishlistItem.category}
          </p>

          {/* Price */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-base-content">
              ₹{wishlistItem.affected_price}
              {wishlistItem.discount_percent && (
                <span className="line-through text-gray-500 ml-2">
                  ₹{wishlistItem.price}
                </span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Link
              to={`/courses/${wishlistItem.slug}`}
              className="btn btn-secondary"
            >
              View Course
            </Link>
            <button
              className="btn btn-outline btn-error"
              onClick={handleWishListItem}
            >
              Remove from Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// WishlistComponent Template
export function Component() {
  const wishList = useSelector((state) => state.wishList.wishList);

  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Wishlist</h1>
          <Link to="/courses" className="btn btn-primary">
            Browse More Courses
          </Link>
        </div>

        {/* Wishlist Courses Section */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Wishlist Course Card */}
          {wishList.map((wishlistItem) => (
            <WishlistCard key={wishlistItem.id} wishlistItem={wishlistItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
