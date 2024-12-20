// import React from "react";
import { useLoaderData, Link } from "react-router-dom";
import Headline from "./components/Headline";

const Dashboard = () => {
  const { teachers, courses, students, orders } = useLoaderData();

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "text-success";
      case "draft":
        return "text-base-content/60";
      case "completed":
        return "text-success";
      case "pending":
        return "text-warning";
      default:
        return "text-base-content/60";
    }
  };

  return (
    <>
      <Headline headline={"Admin Dashboard"} />
      <section className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teachers Card */}
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Active Teachers</h2>
              <p className="text-4xl font-bold">{teachers.active_count}</p>
              <Link to="/admin/users" className="link link-hover mt-2">
                View Teachers
              </Link>
            </div>
          </div>

          {/* Students Card */}
          <div className="card bg-secondary text-secondary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Active Students</h2>
              <p className="text-4xl font-bold">{students.active_count}</p>
              <Link to="/admin/users" className="link link-hover mt-2">
                View Students
              </Link>
            </div>
          </div>

          {/* Courses Card */}
          <div className="card bg-accent text-accent-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Total Courses</h2>
              <p className="text-4xl font-bold">{courses.total_count}</p>
              <div className="mt-2 space-y-1 text-sm">
                {courses.by_status.map((status) => (
                  <p key={status.status} className="capitalize">
                    {status.count} {status.status}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="card bg-neutral text-neutral-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Total Revenue</h2>
              <p className="text-4xl font-bold">
                ${orders.total_revenue.toFixed(2)}
              </p>
              <p className="text-sm">From {orders.total_count} orders</p>
            </div>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Orders Overview</h2>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat">
                  <div className="stat-title">Total Orders</div>
                  <div className="stat-value">{orders.total_count}</div>
                </div>

                {orders.by_status.map((status) => (
                  <div key={status.status} className="stat">
                    <div
                      className={`stat-title capitalize ${getStatusColor(
                        status.status
                      )}`}
                    >
                      {status.status}
                    </div>
                    <div className="stat-value text-2xl">{status.count}</div>
                  </div>
                ))}

                <div className="stat">
                  <div className="stat-title">Revenue</div>
                  <div className="stat-value text-2xl">
                    ${orders.total_revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Link
              to="/admin/users"
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <h3 className="card-title">User Management</h3>
                <p className="text-base-content/70">
                  Manage teachers and students
                </p>
              </div>
            </Link>

            <Link
              to="/admin/courses"
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <h3 className="card-title">Course Management</h3>
                <p className="text-base-content/70">
                  Review and manage courses
                </p>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <h3 className="card-title">Order Management</h3>
                <p className="text-base-content/70">Track orders and revenue</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
