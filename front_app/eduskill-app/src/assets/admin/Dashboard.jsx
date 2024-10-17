// import React from "react";
import Headline from "./components/Headline";

const Dashboard = () => {
  return (
    <>
      <Headline headline={"Admin Dashboard"} />
      <section className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Placeholder for Statistics */}
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Users Registered</h2>
              <p>Placeholder for user statistics</p>
            </div>
          </div>

          <div className="card bg-secondary text-secondary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Courses Available</h2>
              <p>Placeholder for course statistics</p>
            </div>
          </div>

          <div className="card bg-accent text-accent-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Earnings Overview</h2>
              <p>Placeholder for earnings data</p>
            </div>
          </div>
        </div>

        {/* Admin Features Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Admin Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">User Management</h3>
                <p>Manage users, roles, and permissions</p>
                <button className="btn btn-primary">
                  Go to User Management
                </button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Course Management</h3>
                <p>Manage courses, categories, and enrollments</p>
                <button className="btn btn-secondary">
                  Go to Course Management
                </button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Payment Reports</h3>
                <p>View payment history, refunds, and transactions</p>
                <button className="btn btn-accent">View Payment Reports</button>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Notifications</h3>
                <p>Manage notifications for users and courses</p>
                <button className="btn btn-warning">
                  Manage Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
