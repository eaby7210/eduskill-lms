/* eslint-disable react-refresh/only-export-components */
// import React from 'react'

import { useLoaderData, useNavigate } from "react-router-dom";
import apiClient from "../../apis/interceptors/axios";
import Headline from "./components/Headline";
import ModuleList from "./components/ModuleList";
import { useState } from "react";

export function Component() {
  const course = useLoaderData();
  const [isLoading, setLoading] = useState(false);
  const [moduleList, setModuleList] = useState(null);
  const navigate = useNavigate();
  async function getModuleList() {
    setLoading(true);
    const res = await apiClient.get(`/myadmin/courses/${course.id}/modules/`);
    console.log(res.data);
    setModuleList(res.data);
    setLoading(false);
  }

  const handleApprove = async () => {
    const urlStr = `/myadmin/courses/${course.id}/publish/ `;
    // Logic to approve the course
    // console.log("Course Approved:", course.title);
    try {
      const res = await apiClient.post(urlStr);
      if (res.status >= 200 && res.status < 300) {
        alert("Course Approved");
        navigate("/admin/courses/");
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Approval");
    }
  };

  const handleBlock = async () => {
    const urlStr = `/myadmin/courses/${course.id}/block/`;
    // Logic to block the course
    // console.log("Course Blocked:", course.title);
    try {
      const res = await apiClient.post(urlStr);
      if (res.status >= 200 && res.status < 300) {
        alert("Course Blocked");
        navigate("/admin/courses/");
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Blocking");
    }
  };

  return (
    <>
      <Headline headline={"Course Details Page"} />
      <div className="join join-vertical w-11/12 my-2 mx-auto bg-base-200">
        <div className="collapse collapse-arrow join-item border-base-100  border">
          <input type="radio" name="my-accordion-1" defaultChecked />
          <div className="collapse-title text-xl font-medium ">
            Basic Information
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Course Title:</h3>
                <p>{course?.title || "N/A"}</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Category:</h3>
                <p>{course?.category || "N/A"}</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Duration:</h3>
                <p>{course?.duration} hours</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Price:</h3>
                <p>₹ {course?.price}</p>
              </div>

              {course?.discount_percent && (
                <div className="card bg-base-100 shadow-md p-4">
                  <h3 className="font-bold">Discount:</h3>
                  <p>{course?.discount_percent}%</p>
                </div>
              )}

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Completion Certificate:</h3>
                <p>
                  {course?.completion_certificate
                    ? "Available"
                    : "Not Available"}
                </p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Teacher Name:</h3>
                <p>{course?.teacher_name || "N/A"}</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Last Updated:</h3>
                <p>{new Date(course?.last_updated).toLocaleDateString()}</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Published At:</h3>
                <p>
                  {course?.published_at
                    ? new Date(course?.published_at).toLocaleDateString()
                    : "Not Published"}
                </p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Requirements:</h3>
                <p>{course?.requirements || "N/A"}</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Learning Objectives:</h3>
                <p>{course?.learning_objectives || "N/A"}</p>
              </div>

              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="font-bold">Target Audience:</h3>
                <p>{course?.target_audience || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="collapse collapse-arrow join-item border-base-200 border">
          <input type="radio" name="curriculum" onClick={getModuleList} />
          <div className="collapse-title text-xl font-medium">
            Curriculum Details
          </div>
          <div className="collapse-content">
            {moduleList != null && isLoading == false ? (
              <>
                <div className="flex flex-row w-11/12 mx-auto bg-base-300 p-3 gap-3">
                  <div className="divider divider-horizontal divider-start">
                    Modules:
                  </div>
                  <div className="w-full">
                    {moduleList.map((module, index) => (
                      <ModuleList
                        key={module.id}
                        index={index}
                        module={module}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex w-full flex-col gap-4">
                <div className="skeleton h-6 w-full"></div>
                <div className="skeleton h-4 w-2/3"></div>
                <div className="skeleton h-4 w-3/5"></div>
                <div className="skeleton h-4 w-4/6"></div>
                <div className="skeleton h-4 w-1/3"></div>
                <div className="skeleton h-4 w-4/5"></div>
                <div className="skeleton h-4 w-8/12"></div>
              </div>
            )}
          </div>
        </div>

        {course.status === "pending_approval" ? (
          <button className="btn btn-primary " onClick={handleApprove}>
            Approve
          </button>
        ) : course.status === "published" ? (
          <button className="btn btn-error " onClick={handleBlock}>
            Block
          </button>
        ) : (
          "Course is in Invalid state"
        )}
      </div>
    </>
  );
}

export async function loader({ params }) {
  const res = await apiClient(`/myadmin/courses/${params.id}/`);

  return res.data;
}
