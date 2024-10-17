// import React from "react";
import Headline from "../admin/components/Headline";

export default function Dashboard() {
  return (
    <>
      <Headline headline={"Teacher Dashboard"} />
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Total Courses</h2>
            <p className="text-4xl font-bold">5</p>
            <p>Manage and update your courses</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Assignments to Grade</h2>
            <p className="text-4xl font-bold">12</p>
            <p>Review and grade pending assignments</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">New Enrollments</h2>
            <p className="text-4xl font-bold">8</p>
            <p>Check the latest student enrollments</p>
          </div>
        </div>
      </section>

      {/* Manage Courses Section */}
      <section className="mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Your Courses</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Web Development 101</td>
                    <td>25</td>
                    <td>
                      <progress
                        className="progress progress-primary w-20"
                        value="50"
                        max="100"
                      ></progress>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary">Manage</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Advanced React</td>
                    <td>18</td>
                    <td>
                      <progress
                        className="progress progress-primary w-20"
                        value="75"
                        max="100"
                      ></progress>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary">Manage</button>
                    </td>
                  </tr>
                  {/* Add more rows as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Grading Assignments Section */}
      <section className="mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Assignments to Grade</h2>
            <ul className="list-disc ml-6">
              <li className="mb-2">
                Assignment 1: JavaScript Basics -{" "}
                <button className="btn btn-sm btn-primary ml-2">
                  Grade Now
                </button>
              </li>
              <li className="mb-2">
                Assignment 2: React Components -{" "}
                <button className="btn btn-sm btn-primary ml-2">
                  Grade Now
                </button>
              </li>
              {/* Add more assignment items */}
            </ul>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Notifications</h2>
            <ul className="list-disc ml-6">
              <li className="mb-2">New enrollment in Web Development 101.</li>
              <li className="mb-2">
                Reminder: Grade pending assignments for Advanced React.
              </li>
              {/* Add more notifications */}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
