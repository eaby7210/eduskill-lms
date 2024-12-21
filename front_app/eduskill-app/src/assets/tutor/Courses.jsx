/* eslint-disable react/prop-types */
// import React from "react";

import { Link, useLoaderData, useNavigation } from "react-router-dom";
import Headline from "../admin/components/Headline";

function TableRow({ item }) {
  return (
    <tr className="hover">
      <td>
        <Link to={`${item.slug}/`}>
          <div className="flex items-center gap-3">
            <div>
              <div className="font-bold">{item.title}</div>
              <div className="text-sm opacity-50">{item.slug}</div>
            </div>
          </div>
        </Link>
      </td>
      <td>{item.price}</td>
      <td>{item.status}</td>
      <th>
        <button className="btn btn-error btn-xs">Disable</button>
      </th>
    </tr>
  );
}

export default function Courses() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const data = useLoaderData();
  return (
    <>
      <Headline headline={"My Courses"} />
      <div className="overflow-x-auto w-11/12 mx-auto">
        <table className="table">
          <thead>
            <TableHead />
          </thead>
          <tbody>
            {isLoading
              ? [0, 1, 2, 3].map((item) => <TableRowSkelton key={item} />)
              : data.map((item) => <TableRow key={item.id} item={item} />)}
          </tbody>
          {/* foot */}
          <tfoot>
            <TableHead />
          </tfoot>
        </table>
      </div>
    </>
  );
}

function TableHead() {
  return (
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Status</th>
      <th></th>
    </tr>
  );
}

function TableRowSkelton() {
  return (
    <tr className="hover">
      <td>
        <div className="flex items-center gap-3">
          <div className="skeleton h-32 w-32"></div>

          <div className="w-2/3">
            <span className="skeleton h-6 w-full"></span>
          </div>
        </div>
      </td>
      <td>
        <div className="w-2/3">
          <span className="skeleton h-6 w-full"></span>
        </div>
        <br />
        <span className="badge badge-ghost badge-sm w-2/3">
          <div className="skeleton h-full w-full"></div>
        </span>
      </td>
      <td>
        <div className="w-2/3">
          <span className="skeleton h-6 w-full"></span>
        </div>
      </td>
      <th className="">
        <div className="btn btn-ghost btn-xs skeleton w-2/3"></div>
      </th>
    </tr>
  );
}
