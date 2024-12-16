// import React from "react";
import {
  NavLink,
  useActionData,
  useLoaderData,
  useParams,
} from "react-router-dom";
import Headline from "../admin/components/Headline";
import { Outlet } from "react-router-dom";

export default function CoursePage() {
  function activeClasses({ isActive }) {
    return isActive ? "tab-active" : "";
  }

  const actionData = useActionData();
  const params = useParams();
  const courseData = useLoaderData();

  return (
    <>
      <Headline headline={"Course Page"} />
      <div role="tablist" className="tabs tabs-bordered tabs-lg w-full">
        <NavLink
          role="tab"
          to={`/tutor/courses/${params.slug}/`}
          end
          className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
        >
          Course Details
        </NavLink>
        <NavLink
          role="tab"
          to={`/tutor/courses/${params.slug}/curriculum`} // Assuming you have a route for curriculum
          className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
        >
          Curriculum
        </NavLink>
        <NavLink
          role="tab"
          to={`/tutor/courses/${params.slug}/publish`} // Assuming you have a route for publishing the course
          className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
        >
          Publish Course
        </NavLink>
      </div>
      <div className="w-full">
        <Outlet context={{ actionData: actionData, courseData: courseData }} />
      </div>
    </>
  );
}
