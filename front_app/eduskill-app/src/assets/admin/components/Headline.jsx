/* eslint-disable react/prop-types */
// import React from "react";

const Headline = ({ headline }) => {
  return (
    <div className="flex items-center justify-between w-full mb-5">
      <h2 className="text-2xl font-bold flex-grow">{headline}</h2>
      <label
        htmlFor="admin-drawer"
        className="btn btn-sm md:btn-md  btn-primary drawer-button lg:hidden"
      >
        Admin Panels
      </label>
    </div>
  );
};

export default Headline;
