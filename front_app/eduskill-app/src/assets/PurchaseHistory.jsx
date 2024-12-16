/* eslint-disable react-refresh/only-export-components */
import { useMemo } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";

export async function loader() {
  const res = await apiClient("/user/order/");
  return res.data;
}

export function Component() {
  const orders = useLoaderData();
  const navigate = useNavigate();

  // Memoized and processed orders
  const processedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      formattedDate: new Date(order.order_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [orders]);

  // Handle row click to navigate to order details
  const handleRowClick = (orderId) => {
    navigate(`/user/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Purchase History</h1>
          <Link to="/courses" className="btn btn-primary rounded-full">
            Browse More Courses
          </Link>
        </div>

        {/* Orders Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {processedOrders.length === 0 ? (
              <div className="alert alert-info shadow-lg">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current flex-shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>No purchase history found</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  {/* Table Head */}
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total Amount</th>

                      <th>Payment</th>
                      <th>Address</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {processedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-base-200 cursor-pointer transition-colors duration-200"
                        onClick={() => handleRowClick(order.id)}
                      >
                        <td className="font-bold text-primary">#{order.id}</td>
                        <td>{order.formattedDate}</td>
                        <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>

                        <td>
                          <span
                            className={`badge ${
                              order.is_paid ? "badge-primary" : "badge-warning"
                            }`}
                          >
                            {order.is_paid ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="text-sm">{order.address_details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
