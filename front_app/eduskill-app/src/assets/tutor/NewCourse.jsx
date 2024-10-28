// import React from "react";
import { Outlet, useActionData } from "react-router-dom";
import Headline from "../admin/components/Headline";

export default function NewCourse() {
  const actionData = useActionData();
  return (
    <>
      <Headline headline={"Create New Course"} />
      <div role="tablist" className="tabs tabs-bordered tabs-lg w-full">
        <a role="tab" className="tab tab-active">
          Course Details
        </a>
        <a role="tab" className="tab tab-disabled">
          Curɾiculum
        </a>
        <a role="tab" className="tab tab-disabled">
          Publish Course
        </a>
      </div>
      <div className="w-full">
        <Outlet context={actionData} />
      </div>
    </>
  );
}
