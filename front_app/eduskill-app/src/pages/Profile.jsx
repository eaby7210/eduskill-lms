// import React from "react";
import { useSelector } from "react-redux";

const UserProfile = () => {
  const user = useSelector((state) => state.user);

  return (
    <section className="container mx-auto p-6">
      <div className="card bg-base-100 shadow-xl p-6">
        <div className="flex items-center space-x-6">
          {user.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-24 h-24">
                <span className="text-3xl">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </span>
              </div>
            </div>
          )}
          {/* User Info */}
          <div>
            <h2 className="text-3xl font-bold">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-1 space-x-2">
              <span className="badge badge-primary">{user.role}</span>
              {user.is_superuser && (
                <span className="badge badge-secondary">Admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="mt-6">
          <h3 className="text-2xl font-semibold">Profile Information</h3>
          <div className="mt-3">
            <strong>Status: </strong>
            <span
              className={`badge ${
                user.is_active ? "badge-success" : "badge-error"
              }`}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Teacher Profile Information */}
          {user.role === "TUTR" && user.teacher_profile && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold">Teacher Profile</h4>
              <p>
                <strong>Bio: </strong>
                {user.teacher_profile.bio || "N/A"}
              </p>
              <p>
                <strong>Qualifications: </strong>
                {user.teacher_profile.qualifications || "N/A"}
              </p>
              <div>
                <strong>Verified: </strong>
                <span
                  className={`badge ${
                    user.teacher_profile.is_verified
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {user.teacher_profile.is_verified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}

          {user.role !== "TUTR" && user.student_profile && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold">Student Profile</h4>
              <p>
                <strong>Bio: </strong>
                {user.student_profile.bio || "N/A"}
              </p>
              <div>
                <strong>Verified: </strong>
                <span
                  className={`badge ${
                    user.student_profile.is_verified
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {user.student_profile.is_verified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
