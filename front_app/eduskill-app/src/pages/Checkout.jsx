/* eslint-disable react-refresh/only-export-components */
// import React from "react";

import { useSelector } from "react-redux";
import { Form, Link, useNavigate } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
import { useContext, useEffect } from "react";
import appContext from "../apis/Context";
import { usePermissionCheck } from "../hooks/Hooks";

export function Component() {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cart);
  const addToast = useContext(appContext).addToast;
  const checkPermission = usePermissionCheck();
  useEffect(() => {
    checkPermission("/user");
  }, [checkPermission]);

  const totalPrice = parseFloat(
    cartItems
      .reduce((total, item) => total + item.affected_price + 0.7, 0)
      .toFixed(2)
  );

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    try {
      const response = await apiClient.post(
        "/user/cart/create_order/",
        formValues
      );

      if (response.status === 200 || response.status === 201) {
        addToast({
          type: "success",
          message: response.data.message,
        });

        const orderDetails = response.data;

        if (orderDetails.payable_amount == 0) {
          navigate("/user/mylearning");
        } else {
          addToast({
            type: "warning",
            message: "Please complete payment",
          });
          navigate("/payment", { state: { orderDetails: orderDetails } });
        }
        // navigate("/payment");
      }
    } catch (error) {
      // Handle unexpected errors, like network errors
      if (error.response) {
        // Server returned a response (e.g., validation errors)
        addToast({
          type: "error",
          message:
            error.response.data.error ||
            "An error occurred while creating the order.",
        });
      } else {
        // No response received (e.g., network error)
        addToast({
          type: "error",
          message: "Network error. Please try again later.",
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto max-w-4xl">
        {/* Checkout Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Checkout</h1>
          <p className="text-base-content">Complete your purchase below.</p>
        </div>
        <Form method="post" onSubmit={handleSubmit}>
          {/* User Information Form */}
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="text-lg font-semibold mt-4">Address Details</h3>

              {/* Full Name Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">
                    <span className="label-text">Street Address</span>
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    placeholder="123 Main Street"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">City</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* State/Province, Postal Code, and Country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">State/Province</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State/Province"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Postal Code</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Country</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="India"
                    defaultValue="India"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Order Summary */}
            <div className="col-span-2">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title">Order Summary</h2>

                  {/* List Cart Items */}
                  {cartItems.map((item) => (
                    <div
                      className="flex justify-between items-center mb-2"
                      key={item.id}
                    >
                      <span>{item.title}</span>
                      <span className="text-primary">
                        ₹{item.affected_price}
                        {item.discount_percent && (
                          <span className="line-through text-gray-500 ml-2">
                            ₹{item.price}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="divider"></div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice}</span>
                  </div>

                  {/* Button to go back to the cart */}
                  <Link
                    to="/user/cart"
                    className="btn btn-outline w-1/4 btn-sm btn-secondary mt-4"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>
            {/* Right Column - Payment Section */}
            <div className="col-span-1">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title">Payment Information</h2>

                  {/* Wallet Credit Checkbox */}
                  <div className="my-3">
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        name="wallet"
                        id="useWalletCredit"
                        className="checkbox"
                      />
                      <label
                        htmlFor="useWalletCredit"
                        className="cursor-pointer"
                      >
                        Use Wallet Credit
                      </label>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="mb-4">
                    <label className="label">
                      <span className="label-text">Payment Method</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        id="creditCard"
                        className="radio"
                        value="creditCard"
                      />
                      <label
                        htmlFor="creditCard"
                        className="ml-2 cursor-pointer"
                      >
                        Credit Card
                      </label>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        id="paypal"
                        className="radio"
                        value="paypal"
                      />
                      <label htmlFor="paypal" className="ml-2 cursor-pointer">
                        PayPal
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn btn-primary w-full mt-4">
                    Complete Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
