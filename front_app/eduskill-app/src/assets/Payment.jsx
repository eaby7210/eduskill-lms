import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import apiClient from "../apis/interceptors/axios";
import { useErrorHandler } from "../hooks/Hooks";

export function Component() {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const handleError = useErrorHandler();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart.cart);
  console.log(cart);
  const orderDetails = location.state?.orderDetails;
  const [isLoading, setIsLoading] = useState(false);

  // Validate order details and cart
  if (!orderDetails || !cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>No order details found. Please create an order first.</span>
          </div>
        </div>
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    try {
      const options = {
        key: orderDetails.key,
        amount: orderDetails.rzr_order.amount,
        currency: orderDetails.rzr_order.currency,
        name: "EduSkill Learning Platform",
        description: "Course Purchase",
        order_id: orderDetails.rzr_order.id,
        handler: async (response) => {
          try {
            const verifyResponse = await apiClient.post(
              "/user/order/complete_order/ ",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderDetails.order_id,
              }
            );

            if (verifyResponse.status >= 200 && verifyResponse.status < 300) {
              navigate("/user/mylearning", {
                state: { paymentSuccess: true },
              });
            }
          } catch (error) {
            handleError(error);
          }
        },
        prefill: {
          name: `${user?.first_name} ${user?.last_name}`,
          email: user?.email,
        },
        theme: {
          color: "#1eb854",
        },
      };

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + parseFloat(item?.affected_price || item?.price),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl hover:shadow-xl transition-shadow duration-300">
        <div className="card-body space-y-4">
          {/* Order Header */}
          <div className="flex justify-between items-center">
            <h2 className="card-title text-primary">Payment Confirmation</h2>
            <div className="badge badge-secondary">
              {orderDetails?.rzr_order.status}
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div className="flex-grow">
                  <h3 className="text-sm font-semibold">{item?.title}</h3>
                </div>
                <div className="badge badge-primary badge-sm">
                  ₹{parseFloat(item?.affected_price || item?.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Total Price */}
          <div className="divider"></div>
          <div className="flex justify-between items-center font-bold">
            <span className="text-lg">Total Payable:</span>
            <span className="text-xl text-primary">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Pay Button */}
          <div className="card-actions">
            <button
              onClick={handleRazorpayPayment}
              className="btn btn-primary w-full rounded-full 
                         hover:scale-105 active:scale-95 
                         transition-transform duration-200 
                         shadow-md hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Pay With Razorpay"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
