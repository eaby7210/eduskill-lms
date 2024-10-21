// import React from 'react'
import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Learning</h1>
          <Link to="/profile" className="btn btn-primary">
            Profile Settings
          </Link>
        </div>

        {/* Enrolled Courses Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loop over enrolled courses */}
          <div className="col-span-1 lg:col-span-2">
            <div className="card bg-base-100 shadow-lg mb-4">
              <div className="card-body">
                <h2 className="card-title text-primary">React for Beginners</h2>
                <p className="text-sm text-base-content mb-2">
                  Instructor: John Doe
                </p>

                {/* Course Progress Bar */}
                <div className="flex justify-between items-center mb-4">
                  <progress
                    className="progress progress-primary w-full"
                    value="75"
                    max="100"
                  ></progress>
                  <span className="ml-4 text-sm font-bold text-base-content">
                    75%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Link
                    to="/course/react-for-beginners"
                    className="btn btn-secondary"
                  >
                    Continue Learning
                  </Link>
                  <div className="flex space-x-2">
                    <Link
                      to="/course/react-for-beginners/assignments"
                      className="btn btn-outline btn-primary"
                    >
                      Assignments
                    </Link>
                    <Link
                      to="/course/react-for-beginners/resources"
                      className="btn btn-outline btn-primary"
                    >
                      Resources
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg mb-4">
              <div className="card-body">
                <h2 className="card-title text-primary">Advanced Python</h2>
                <p className="text-sm text-base-content mb-2">
                  Instructor: Jane Smith
                </p>

                {/* Course Progress Bar */}
                <div className="flex justify-between items-center mb-4">
                  <progress
                    className="progress progress-primary w-full"
                    value="40"
                    max="100"
                  ></progress>
                  <span className="ml-4 text-sm font-bold text-base-content">
                    40%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Link
                    to="/course/advanced-python"
                    className="btn btn-secondary"
                  >
                    Continue Learning
                  </Link>
                  <div className="flex space-x-2">
                    <Link
                      to="/course/advanced-python/assignments"
                      className="btn btn-outline btn-primary"
                    >
                      Assignments
                    </Link>
                    <Link
                      to="/course/advanced-python/resources"
                      className="btn btn-outline btn-primary"
                    >
                      Resources
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Add more courses similarly */}
          </div>

          {/* Summary & Quick Stats Section */}
          <div className="col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-primary">Quick Stats</h2>
                <div className="text-lg font-bold text-base-content">
                  Completed Courses: 2/5
                </div>
                <progress
                  className="progress progress-accent w-full my-4"
                  value="40"
                  max="100"
                ></progress>
                <p className="text-sm text-base-content mb-4">
                  You&apos;re making good progress, keep going!
                </p>

                <Link
                  to="/progress"
                  className="btn btn-outline btn-accent w-full"
                >
                  View Detailed Progress
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
