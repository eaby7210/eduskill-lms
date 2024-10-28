// import React from "react";

import NavList from "./components/NavList";
import Horse from "./svgs/horse";
import NavEnd from "./components/NavEnd";
import { NavLink } from "react-router-dom";
import NavStore from "./components/NavStore";
// import User from "./svgs/User";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <NavList />
            <div>
              <NavEnd />
            </div>
          </ul>
        </div>
        <NavLink to="/" className="btn btn-ghost text-xl ">
          <Horse h={"h-10"} w={"w-10"} /> EduSkill
        </NavLink>
      </div>
      <div className="navbar hidden lg:flex">
        <ul className="menu menu-horizontal px-1 z-40">
          <NavList />
        </ul>
      </div>
      <div className="navbar-end flex gap-2 mx-1">
        <NavStore />
      </div>
      <div className="navbar-end hidden lg:flex min-w-fit">
        <NavEnd />
      </div>
    </div>
  );
};

export default Navbar;
