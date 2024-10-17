/* eslint-disable react/prop-types */
// import React from "react";

import { Link } from "react-router-dom";

export default function CourseCard({ item }) {
  return (
    <>
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure className="lg:w-1/3">
          <img
            src={
              item.image
                ? item.image
                : "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
            }
            alt="Album"
            className="xl:h-4/6 2xl:h-full md:h-52 h-52  object-cover"
          />
        </figure>
        <div className="card-body lg:w-2/3">
          <h2 className="card-title text-3xl font-bold">{item?.title}</h2>
          <p className="text-lg">{item.description}</p>
          <div className="card-actions justify-end">
            <Link to={`/courses/${item.slug}`} className="btn btn-primary">
              Listen
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
