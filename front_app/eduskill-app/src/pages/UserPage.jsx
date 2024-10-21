// import React from "react";
import { useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";

const UserProfile = () => {
  const user = useSelector((state) => state.user);

  function activeClasses({ isActive }) {
    return isActive ? "tab-active bg-base-200" : "";
  }

  return (
    <section className="w-full md:w-11/12 mx-auto p-6 ">
      <div className="card bg-base-100 shadow-xl p-6 ">
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
                  {user?.first_name[0]}
                  {user?.last_name[0]}
                </span>
              </div>
            </div>
          )}
          {/* User Info */}
          <div>
            <h2 className="text-3xl font-bold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-1 space-x-2">
              <span className="badge badge-primary">{user?.role}</span>
              {user.is_superuser && (
                <span className="badge badge-secondary">Admin</span>
              )}
            </div>
          </div>
        </div>

        <div
          role="tablist"
          className="tabs tabs-bordered bg-base-300 rounded-md w-full tabs-sm md:tabs-md lg:tabs-lg my-5"
        >
          <NavLink
            to=""
            end
            role="tab"
            className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="mylearning"
            end
            role="tab"
            className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
          >
            My Learning
          </NavLink>
          <NavLink
            to="wishlist"
            end
            role="tab"
            className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
          >
            Wishlist
          </NavLink>
          <NavLink
            to="cart"
            end
            role="tab"
            className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
          >
            Cart
          </NavLink>
          <NavLink
            to="orders"
            end
            role="tab"
            className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
          >
            Purchase History
          </NavLink>
          <NavLink
            to="settings"
            end
            role="tab"
            className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
          >
            Settings
          </NavLink>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
