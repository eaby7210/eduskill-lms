// import React from "react";
import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Wishlist</h1>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>

        {/* Wishlist Courses Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wishlist Course Card */}
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

                {/* Price and Discount */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-base-content">
                    $149.99
                  </span>
                  <span className="text-sm text-accent">20% off</span>
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
                    Remove from Wishlist
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

                {/* Price and Discount */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-base-content">
                    $199.99
                  </span>
                  <span className="text-sm text-accent">15% off</span>
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
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            </div>

            {/* Add more wishlist items similarly */}
          </div>

          {/* Wishlist Summary & Actions */}
          <div className="col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-primary">Wishlist Summary</h2>
                <div className="text-lg font-bold text-base-content">
                  Courses in Wishlist: 3
                </div>
                <p className="text-sm text-base-content mb-4">
                  You can enroll in these courses to start learning immediately.
                </p>

                <Link to="/cart" className="btn btn-outline btn-accent w-full">
                  Go to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
