// import React from 'react'

import { useOutletContext } from "react-router-dom";

export default function Publish() {
  const { courseData } = useOutletContext();
  const course = courseData;

  return (
    <>
      <h1>Publish</h1>
      {course.status == "draft" ? (
        <button
          className="btn btn-accent w-full text-xl"
          // onClick={handleSubmit}
        >
          Publish Course
        </button>
      ) : course.status == "published" ? (
        <p>Course is published to public</p>
      ) : course.status == "published" ? (
        <p>Requested for Approval</p>
      ) : (
        ""
      )}
    </>
  );
}
