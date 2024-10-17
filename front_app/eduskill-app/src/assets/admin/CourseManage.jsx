// import React from 'react';

import { useLoaderData } from "react-router-dom";
import Headline from "./components/Headline";

const CourseManage = () => {
  const courses = useLoaderData();
  console.log(courses);
  return (
    <>
      <Headline headline={"Course Manage"} />
      <div className="w-11/12 mx-auto overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>duration</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

function CourseRow({ course }) {
  return (
    <tr>
      <th>{course.id}</th>
      <td>{course.title}</td>
      <td>{course.duration} hours</td>
      <td>{course.price}</td>
    </tr>
  );
}

export default CourseManage;
