/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postCartItem } from "../apis/services/apiUser";
import { removeCartItem } from "../apis/redux/Cart/cartSlice";

// export async function loader() {
//   const res = await apiClient("/user/cart/");
//   return res.data;
// }

function CartCard({ cartItem }) {
  const dispatch = useDispatch();
  async function handleCartItem() {
    try {
      await postCartItem(cartItem.id);
      dispatch(removeCartItem(cartItem));
    } catch {
      alert("Unable to remove from Cart");
    }
  }
  return (
    <div className="col-span-2">
      <div className="card bg-base-100 shadow-lg mb-4">
        <div className="card-body">
          {/* Course Title */}
          <h2 className="card-title text-primary">{cartItem.title}</h2>

          {/* Instructor and Category */}
          <p className="text-sm text-base-content mb-2">
            Instructor: {cartItem.teacher_name}
          </p>
          <p className="text-sm text-base-content mb-4">
            Category: {cartItem.category}
          </p>

          {/* Price and Quantity */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-base-content">
              ₹{cartItem.affected_price}
              {cartItem.discount_percent && (
                <span className="line-through text-gray-500 ml-2">
                  ₹{cartItem.price}
                </span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Link
              to={`/courses/${cartItem.slug}`}
              className="btn btn-secondary"
            >
              View Course
            </Link>
            <button
              className="btn btn-outline btn-error"
              onClick={handleCartItem}
            >
              Remove from Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Component() {
  const cart = useSelector((state) => state.cart.cart);
  console.log(cart);

  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Cart</h1>
          {cart.length > 0 && (
            <Link to="/courses" className="btn btn-primary">
              Proceed to Checkout
            </Link>
          )}
        </div>

        {/* Cart Courses Section */}
        <div className="grid grid-cols-2  xl:grid-cols-4  gap-6">
          {/* Cart Course Card */}
          {cart.length <= 0 && <p className="text-center">Cart is Empty</p>}
          {cart.map((cartItem) => (
            <CartCard key={cartItem.id} cartItem={cartItem} />
          ))}

          {/* Cart Summary & Checkout */}
        </div>
      </div>
    </div>
  );
}
