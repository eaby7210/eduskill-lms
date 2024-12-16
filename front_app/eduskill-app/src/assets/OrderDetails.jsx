/* eslint-disable react-refresh/only-export-components */
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
import { useState } from "react";

export async function loader({ params }) {
  const res = await apiClient(`/user/order/${params.id}`);
  return res.data;
}
export function Component() {
  const order = useLoaderData();
  const navigate = useNavigate();
  const [isRefunding, setIsRefunding] = useState({});

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle refund for a specific course
  const handleRefund = async (courseId) => {
    try {
      setIsRefunding((prev) => ({ ...prev, [courseId]: true }));

      // Implement your refund logic here
      const response = await apiClient.post(`/user/refund/`, {
        order_id: order.id,
        course_id: courseId,
      });

      if (response.status === 200) {
        // Optionally, you can refresh the page or update the state
        navigate("/user/purchase-history", {
          state: {
            toast: {
              type: "success",
              message: "Refund processed successfully",
            },
          },
        });
      }
    } catch (error) {
      console.error("Refund failed", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsRefunding((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Order #{order.id}</h1>
          <Link to="/user/purchase-history" className="btn btn-ghost">
            Back to Purchase History
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Order Details */}
              <div>
                <h2 className="card-title mb-4">Order Information</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-bold">Order Date:</span>{" "}
                    {formatDate(order.order_date)}
                  </p>
                  <p>
                    <span className="font-bold">Status:</span>{" "}
                    <span
                      className={`badge ${
                        order.status === "completed"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold">Payment:</span>{" "}
                    <span
                      className={`badge ${
                        order.is_paid ? "badge-primary" : "badge-ghost"
                      }`}
                    >
                      {order.is_paid ? "Paid" : "Pending"}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold">Total Amount:</span> ₹
                    {parseFloat(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="card-title mb-4">Shipping Address</h2>
                <div className="space-y-2">
                  <p>{order.address.name}</p>
                  <p>{order.address.street_address}</p>
                  <p>
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.postal_code}
                  </p>
                  <p>{order.address.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link
                          to={`/courses/${item.course}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.course_title}
                        </Link>
                      </td>
                      <td>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        {order.is_paid && (
                          <button
                            onClick={() => handleRefund(item.course)}
                            className="btn btn-sm btn-error"
                            disabled={isRefunding[item.course]}
                          >
                            {isRefunding[item.course] ? (
                              <span className="loading loading-spinner"></span>
                            ) : (
                              "Refund"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
