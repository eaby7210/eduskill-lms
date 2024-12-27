/* eslint-disable react-refresh/only-export-components */
// import React from 'react'

import { useContext, useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
import store from "../apis/redux/store";
import { userLogout } from "../apis/redux/User/userSlice";
import { useSelector } from "react-redux";
import { useErrorHandler, usePermissionCheck } from "../hooks/Hooks";
import appContext from "../apis/Context";

export async function action({ request }) {
  const actionData = await request.formData();
  if (actionData.get("form") === "pass_change") {
    const formData = new FormData();
    formData.append("current_password", actionData.get("current_password"));
    formData.append("new_password1", actionData.get("new_password1"));
    formData.append("new_password2", actionData.get("new_password2"));
    try {
      await apiClient.post("auth/password/change/", formData);
      store.dispatch(userLogout());
      return redirect("/login");
    } catch (error) {
      return error.response.data;
    }
  } else if (actionData.get("form") === "profile_update") {
    const formData = new FormData();
    formData.append("first_name", actionData.get("first_name"));
    formData.append("last_name", actionData.get("last_name"));
    formData.append("username", actionData.get("username"));
    formData.append("email", actionData.get("email"));

    if (actionData.get("bio")) {
      formData.append("bio", actionData.get("bio"));
    }

    if (actionData.get("qualifications")) {
      formData.append("qualifications", actionData.get("qualifications"));
    }
    const image = actionData.get("image");
    if (image && image.size > 0) {
      formData.append("image", image);
    }

    try {
      const res = await apiClient.put("/auth/user/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { status: parseInt(res.status / 100), data: res.data };
    } catch (error) {
      return { status: 4, data: error.response.data };
    }
  }
  return null;
}

export function Component() {
  const checkPermission = usePermissionCheck();

  checkPermission();

  const navigation = useNavigation();
  const res = useActionData();
  const { addToast } = useContext(appContext);
  const handleerror = useErrorHandler();
  const user = useSelector((state) => state.user);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const isSubmitting = navigation.state === "submitting";
  const closeProfileModal = () => setProfileModalOpen(false);
  const closePasswordModal = () => setPasswordModalOpen(false);
  const [response, setResponse] = useState(null);
  useEffect(() => {
    if (res && res?.status != 2) {
      setResponse(res.data);
    } else if (res) {
      closeProfileModal();
    }
  }, [res]);
  async function handleEmailVerify() {
    try {
      if (!user.email_verified) {
        const res = await apiClient.post("/auth/register/resend-email/", {
          email: user.email,
        });
        if (res.status >= 200 && res.status < 300) {
          addToast({
            type: "info",
            message: "Email verification link sent to your email",
          });
        }
      }
    } catch (error) {
      handleerror(error);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
          <div className="mt-6">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="btn btn-secondary mr-2"
            >
              Update Profile
            </button>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn btn-primary"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="card bg-base-100 shadow-lg p-6 mb-8 gap-3">
          <h2 className="text-2xl text-primary mb-2">Your Profile</h2>
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}{" "}
            {!user?.email_verified && (
              <button
                className="btn btn-sm btn-warning"
                onClick={handleEmailVerify}
              >
                Verify
              </button>
            )}
          </p>
          {user?.role === "TUTR" ? (
            <>
              <p>
                <strong>Tutor Bio:</strong>{" "}
                {user?.teacher_profile?.bio || "No bio available"}
              </p>
              <p>
                <strong>Tutor Qualification:</strong>{" "}
                {user?.teacher_profile.qualifications || "No bio available"}
              </p>
            </>
          ) : (
            <p>
              <strong>Student Bio:</strong>{" "}
              {user?.student_profile?.bio || "No bio available"}
            </p>
          )}
        </div>

        {/* Profile Update Modal */}
        {isProfileModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-primary">Update Profile</h3>
              <Form method="post" encType="multipart/form-data">
                <div className="flex flex-row">
                  <div className="form-control mb-4">
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      className="input input-bordered"
                      defaultValue={user?.first_name}
                    />
                    {response?.first_name &&
                      response.first_name.map((error, index) => (
                        <span
                          key={index}
                          className="label-text text-center text-red-600"
                        >
                          {error}
                        </span>
                      ))}
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className="input input-bordered"
                      defaultValue={user?.last_name}
                    />
                    {response?.last_name &&
                      response.last_name.map((error, index) => (
                        <span
                          key={index}
                          className="label-text text-center text-red-600"
                        >
                          {error}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="form-control mb-4">
                  <label className="label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="input input-bordered"
                    defaultValue={user?.username}
                  />
                  {response?.username &&
                    response.username.map((error, index) => (
                      <span
                        key={index}
                        className="label-text text-center text-red-600"
                      >
                        {error}
                      </span>
                    ))}
                </div>
                <div className="form-control mb-4">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered"
                    defaultValue={user?.email}
                  />
                  {response?.email &&
                    response.email.map((error, index) => (
                      <span
                        key={index}
                        className="label-text text-center text-red-600"
                      >
                        {error}
                      </span>
                    ))}
                </div>
                <input type="hidden" name="form" value="profile_update" />
                <div className="form-control mb-4">
                  <label className="label">Bio</label>
                  <textarea
                    name="bio"
                    className="textarea textarea-bordered"
                    defaultValue={
                      user?.role == "TUTR"
                        ? user.teacher_profile.bio
                        : user.student_profile.bio
                    }
                  ></textarea>
                  {response?.bio &&
                    response.bio.map((error, index) => (
                      <span
                        key={index}
                        className="label-text text-center text-red-600"
                      >
                        {error}
                      </span>
                    ))}
                </div>
                {user?.role == "TUTR" && (
                  <div className="form-control mb-4">
                    <label className="label">Qualification</label>
                    <textarea
                      name="qualifications"
                      className="textarea textarea-bordered"
                      defaultValue={user?.teacher_profile.qualifications}
                    ></textarea>
                    {response?.qualifications &&
                      response.qualifications.map((error, index) => (
                        <span
                          key={index}
                          className="label-text text-center text-red-600"
                        >
                          {error}
                        </span>
                      ))}
                  </div>
                )}
                <div className="form-control mb-4">
                  <label className="label">Profile Photo</label>
                  <input
                    type="file"
                    name="image"
                    className="file-input file-input-bordered"
                  />
                  {response?.image &&
                    response.image.map((error, index) => (
                      <span
                        key={index}
                        className="label-text text-center text-red-600"
                      >
                        {error}
                      </span>
                    ))}
                </div>
                <div className="modal-action">
                  <button type="submit" className="btn btn-primary w-1/3">
                    {isSubmitting ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeProfileModal}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-primary mb-3 ">
                Change Password
              </h3>
              <div role="alert" className="alert py-1 text-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>After password change. You have to Login again.</span>
              </div>
              <Form method="post">
                <div className="form-control mb-4">
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    className="input input-bordered"
                    required
                  />
                  {res?.current_password && (
                    <span className="label-text text-center text-red-600">
                      {res.current_password[0]}
                    </span>
                  )}
                </div>
                <div className="form-control mb-4">
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    name="new_password1"
                    className="input input-bordered"
                    required
                  />
                  {res?.new_password1 &&
                    res.new_password1.map((error, index) => (
                      <span
                        key={index}
                        className="label-text text-center text-red-600"
                      >
                        {error}
                      </span>
                    ))}
                </div>
                <div className="form-control mb-4">
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    name="new_password2"
                    className="input input-bordered"
                    required
                  />
                  {res?.new_password2 &&
                    res.new_password2.map((error, index) => (
                      <span
                        key={index}
                        className="label-text text-center text-red-600"
                      >
                        {error}
                      </span>
                    ))}
                </div>
                <input type="hidden" name="form" value="pass_change" />
                <div className="modal-action">
                  <button type="submit" className="btn btn-primary w-2/5">
                    {isSubmitting ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closePasswordModal}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
