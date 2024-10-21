// import React from "react";

import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Purchase History</h1>
          <Link to="/courses" className="btn btn-primary">
            Browse More Courses
          </Link>
        </div>

        {/* Purchase History List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase History Card */}
          <div className="card bg-base-100 shadow-lg mb-4">
            <div className="card-body">
              <h2 className="card-title text-primary">
                Full-Stack Web Development
              </h2>
              <p className="text-sm text-base-content mb-2">
                Instructor: Alex Johnson
              </p>
              <p className="text-sm text-base-content mb-2">
                Purchased on: Oct 12, 2023
              </p>
              <p className="text-sm text-base-content mb-4">
                Order ID: #123456789
              </p>

              {/* Price and Status */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-base-content">
                  $149.99
                </span>
                <span className="badge badge-success">Completed</span>
              </div>

              {/* View Details Button */}
              <div className="mt-4">
                <Link
                  to="/course/full-stack-web-development"
                  className="btn btn-secondary"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>

          {/* Another Purchase History Card */}
          <div className="card bg-base-100 shadow-lg mb-4">
            <div className="card-body">
              <h2 className="card-title text-primary">
                Data Science with Python
              </h2>
              <p className="text-sm text-base-content mb-2">
                Instructor: Maria Smith
              </p>
              <p className="text-sm text-base-content mb-2">
                Purchased on: Sep 18, 2023
              </p>
              <p className="text-sm text-base-content mb-4">
                Order ID: #987654321
              </p>

              {/* Price and Status */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-base-content">
                  $199.99
                </span>
                <span className="badge badge-warning">Pending</span>
              </div>

              {/* View Details Button */}
              <div className="mt-4">
                <Link
                  to="/course/data-science-python"
                  className="btn btn-secondary"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
