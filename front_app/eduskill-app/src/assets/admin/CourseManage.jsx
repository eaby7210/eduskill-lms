/* eslint-disable react/prop-types */

import { Link, useLoaderData, useNavigate } from "react-router-dom";
import Headline from "./components/Headline";
import { useContext, useState } from "react";
import apiClient from "../../apis/interceptors/axios";
import appContext from "../../apis/Context";

const CourseManage = () => {
  const courses = useLoaderData();

  return (
    <>
      <Headline headline={"Course Manage"} />
      <div className="w-11/12 mx-auto overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Id</th>
              <th>Title</th>
              <th>duration</th>
              <th>Price</th>
              <th>Actions</th>
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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useContext(appContext);
  const handleApprove = async () => {
    const urlStr = `/myadmin/courses/${course.id}/publish/ `;
    // Logic to approve the course
    // console.log("Course Approved:", course.title);
    try {
      const res = await apiClient.post(urlStr);
      if (res.status >= 200 && res.status < 300) {
        navigate("/admin/courses/");
        setShowApproveModal(false);
        addToast({
          type: "success",
          message: `Course Approved Successfully`,
        });
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Approval");
    }
  };

  const handleBlock = async () => {
    const urlStr = `/myadmin/courses/${course.id}/block/`;
    // Logic to block the course
    try {
      const res = await apiClient.post(urlStr);
      if (res.status >= 200 && res.status < 300) {
        navigate("/admin/courses/");
        setShowBlockModal(false);
        addToast({
          type: "warning",
          message: `Course Blocked Successfully`,
        });
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Blocking");
    }
  };

  return (
    <>
      <tr className="hover">
        <Link to={`${course.id}`}>
          <th>{course.id}</th>
        </Link>
        <Link to={`${course.id}`}>
          <td>{course.title}</td>
        </Link>
        <td>{course.duration} hours</td>
        <td>₹ {course.price}</td>
        <td className="flex flex-col md:flex-row gap-2">
          {course.status === "pending_approval" ? (
            <button
              className="btn btn-primary btn-xs"
              onClick={() => setShowApproveModal(true)}
            >
              Approve
            </button>
          ) : course.status === "published" ? (
            <button
              className="btn btn-error btn-xs"
              onClick={() => setShowBlockModal(true)}
            >
              Block
            </button>
          ) : (
            "Course is in Invalid state"
          )}
        </td>
      </tr>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Approve Course</h3>
            <p>Are you sure you want to approve the course: {course.title}?</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleApprove}>
                Yes, Approve
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Block Course</h3>
            <p>Are you sure you want to block the course: {course.title}?</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleBlock}>
                Yes, Block
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default CourseManage;
