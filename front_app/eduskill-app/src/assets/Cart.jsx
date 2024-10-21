import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Cart</h1>
          <Link to="/courses" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>

        {/* Cart Courses Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Course Card */}
          <div className="col-span-1 lg:col-span-2">
            <div className="card bg-base-100 shadow-lg mb-4">
              <div className="card-body">
                <h2 className="card-title text-primary">
                  Full-Stack Web Development
                </h2>
                <p className="text-sm text-base-content mb-2">
                  Instructor: Alex Johnson
                </p>
                <p className="text-sm text-base-content mb-4">
                  Category: Development
                </p>

                {/* Price and Quantity */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-base-content">
                    $149.99
                  </span>
                  <div className="flex items-center">
                    <button className="btn btn-outline btn-error btn-xs">
                      -
                    </button>
                    <span className="mx-2">1</span>
                    <button className="btn btn-outline btn-primary btn-xs">
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Link
                    to="/course/full-stack-web-development"
                    className="btn btn-secondary"
                  >
                    View Course
                  </Link>
                  <button className="btn btn-outline btn-error">
                    Remove from Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg mb-4">
              <div className="card-body">
                <h2 className="card-title text-primary">
                  Data Science with Python
                </h2>
                <p className="text-sm text-base-content mb-2">
                  Instructor: Maria Smith
                </p>
                <p className="text-sm text-base-content mb-4">
                  Category: Data Science
                </p>

                {/* Price and Quantity */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-base-content">
                    $199.99
                  </span>
                  <div className="flex items-center">
                    <button className="btn btn-outline btn-error btn-xs">
                      -
                    </button>
                    <span className="mx-2">1</span>
                    <button className="btn btn-outline btn-primary btn-xs">
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Link
                    to="/course/data-science-python"
                    className="btn btn-secondary"
                  >
                    View Course
                  </Link>
                  <button className="btn btn-outline btn-error">
                    Remove from Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Add more cart items similarly */}
          </div>

          {/* Cart Summary & Checkout */}
          <div className="col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-primary">Cart Summary</h2>

                {/* Total Amount */}
                <div className="text-lg font-bold text-base-content mb-4">
                  Total: $349.98
                </div>

                {/* Discount Section */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text text-base-content">
                      Apply Coupon Code
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="input input-bordered"
                  />
                </div>

                <button className="btn btn-outline btn-accent w-full mb-4">
                  Apply Coupon
                </button>

                <Link to="/checkout" className="btn btn-primary w-full">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
