/* eslint-disable react-refresh/only-export-components */
import { Link, useLoaderData } from "react-router-dom";
import { usePermissionCheck } from "../hooks/Hooks";
import apiClient from "../apis/interceptors/axios";

export async function loader() {
  const res = await apiClient("/user/dashboard/");
  return res.data;
}
export function Component() {
  usePermissionCheck()();
  const data = useLoaderData();

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

        {/* Stats Overview */}
        <div className="stats stats-vertical lg:stats-horizontal shadow mb-8">
          <div className="stat">
            <div className="stat-title">Wallet Balance</div>
            <div className="stat-value">${data.wallet.balance.toFixed(2)}</div>
          </div>
          {data.courses.count_by_status.map((status, index) => (
            <div key={index} className="stat">
              <div className="stat-title">
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}{" "}
                Courses
              </div>
              <div className="stat-value">{status.count}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-2">
            {/* Enrolled Courses Section */}
            <div className="card bg-base-300 shadow-lg mb-6">
              <div className="card-body">
                <h2 className="card-title text-secondary">Enrolled Courses</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Course Name</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.courses.recent_courses.map((course, index) => (
                        <tr key={index}>
                          <td>{course.course__title}</td>
                          <td>
                            <progress
                              className="progress progress-primary w-56"
                              value={course.progress}
                              max="100"
                            ></progress>
                          </td>
                          <td>{course.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Progress Overview Section */}
            <div className="card bg-base-300 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-secondary">Progress Overview</h2>
                <div className="flex justify-between items-center">
                  {data.courses.count_by_status.map((status, index) => (
                    <p key={index} className="text-xl">
                      {status.status.charAt(0).toUpperCase() +
                        status.status.slice(1)}
                      :<span className="font-bold">{status.count}</span>
                    </p>
                  ))}
                </div>
                <Link to="/progress" className="btn btn-outline mt-4">
                  View Detailed Progress
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Notifications Section */}
            <div className="card bg-base-300 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-secondary">Notifications</h2>
                <ul className="list-disc pl-5">
                  {data.notifications.map((notification, index) => (
                    <li key={index} className="mb-2">
                      <span className="text-info font-bold">
                        {new Date(notification.timestamp).toLocaleDateString()}:
                      </span>
                      {notification.message}
                    </li>
                  ))}
                </ul>
                <Link to="/notifications" className="btn btn-outline mt-4">
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
