// import React from 'react'

import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>
          <Link to="/profile" className="btn btn-primary">
            Profile Settings
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Courses Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="card bg-base-300 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-secondary">Enrolled Courses</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Course Name</th>
                        <th>Progress</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Loop through courses */}
                      <tr>
                        <td>React for Beginners</td>
                        <td>
                          <progress
                            className="progress progress-primary w-56"
                            value="70"
                            max="100"
                          ></progress>
                        </td>
                        <td>
                          <Link
                            to="/course/react-for-beginners"
                            className="btn btn-secondary"
                          >
                            Continue
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Advanced Python</td>
                        <td>
                          <progress
                            className="progress progress-primary w-56"
                            value="50"
                            max="100"
                          ></progress>
                        </td>
                        <td>
                          <Link
                            to="/course/advanced-python"
                            className="btn btn-secondary"
                          >
                            Continue
                          </Link>
                        </td>
                      </tr>
                      {/* Add more courses */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Section */}
          <div>
            <div className="card bg-base-300 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-secondary">Announcements</h2>
                <ul className="list-disc pl-5">
                  <li className="mb-2">
                    <span className="text-info font-bold">
                      New Assignment:{" "}
                    </span>
                    Complete the JavaScript project by next week.
                  </li>
                  <li className="mb-2">
                    <span className="text-info font-bold">New Course: </span>
                    Data Science with Python is now available!
                  </li>
                  {/* Add more announcements */}
                </ul>
                <Link to="/announcements" className="btn btn-outline mt-4">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="card bg-base-300 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-secondary">
                  Pending Assignments
                </h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Course</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Loop through assignments */}
                      <tr>
                        <td>JavaScript Final Project</td>
                        <td>React for Beginners</td>
                        <td>2024-10-25</td>
                        <td>
                          <span className="badge badge-warning">
                            Incomplete
                          </span>
                        </td>
                        <td>
                          <Link
                            to="/assignments/js-project"
                            className="btn btn-primary"
                          >
                            Submit
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Python Machine Learning</td>
                        <td>Advanced Python</td>
                        <td>2024-11-10</td>
                        <td>
                          <span className="badge badge-error">Overdue</span>
                        </td>
                        <td>
                          <Link
                            to="/assignments/ml-assignment"
                            className="btn btn-primary"
                          >
                            Submit
                          </Link>
                        </td>
                      </tr>
                      {/* Add more assignments */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview Section */}
          <div>
            <div className="card bg-base-300 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-secondary">Progress Overview</h2>
                <div className="flex justify-between items-center">
                  <p className="text-xl">
                    Courses Completed: <span className="font-bold">2/5</span>
                  </p>
                  <progress
                    className="progress progress-accent w-48"
                    value="40"
                    max="100"
                  ></progress>
                </div>
                <Link to="/progress" className="btn btn-outline mt-4">
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
