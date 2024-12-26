// import React from "react";

import { useRef } from "react";
import { useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";

const AdminApp = () => {
  const user = useSelector((state) => state.user);
  const drawerCheckRef = useRef(null);
  const handleCloseDrawer = () => {
    if (drawerCheckRef.current) {
      drawerCheckRef.current.checked = false;
    }
  };
  return (
    <>
      <section className="container  max-w-screen-2xl  mx-auto p-2">
        <div className="drawer lg:drawer-open">
          <input
            id="admin-drawer"
            type="checkbox"
            ref={drawerCheckRef}
            className="drawer-toggle"
          />
          <div className="drawer-content flex flex-col items-center ">
            {/* Page content here */}
            <Outlet />
          </div>
          <div className="drawer-side">
            <label
              htmlFor="admin-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 text-base-content gap-2 min-h-full w-64 p-4">
              {/* Sidebar content here */}
              {user?.is_superuser ? (
                <>
                  <li>
                    <NavLink to="" end onClick={handleCloseDrawer}>
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="users/" onClick={handleCloseDrawer}>
                      User Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="courses/" onClick={handleCloseDrawer}>
                      Course Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="category/" onClick={handleCloseDrawer}>
                      Category Management
                    </NavLink>
                  </li>
                </>
              ) : (
                user.teacher_profile?.id && (
                  <>
                    <li>
                      <NavLink to="" end onClick={handleCloseDrawer}>
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="courses/" end onClick={handleCloseDrawer}>
                        My Courses
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="courses/new" end onClick={handleCloseDrawer}>
                        Course Creation
                      </NavLink>
                    </li>
                  </>
                )
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminApp;
