/* eslint-disable react/prop-types */
// import React from "react";

import { useRevalidator } from "react-router-dom";
import apiClient from "../../../apis/interceptors/axios";

export default function CourseActiveModal({ is_active, courseSlug }) {
  console.log(is_active);
  console.log(courseSlug);
  const revalidator = useRevalidator();
  async function handleActivation() {
    try {
      const res = await apiClient.post(
        `/tutor/courses/${courseSlug}/toggle_active/`
      );
      if (res.status >= 200 && res.status < 300) {
        alert(`course ${is_active ? "Disabled" : "Enabled"}`);
        revalidator.revalidate();
      }
    } catch (error) {
      alert(`Error in toggling: ${error.message}`);
    }
  }
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {is_active ? "Disable Course" : "Enable Course"}
          </h3>
          <p className="py-4">
            Are your sure to {is_active ? "Disable" : "Enable"} this course
          </p>
          <div className="modal-action w-full">
            <form method="dialog">
              <button className="btn btn-ghost btn-sm ">Close</button>
              {is_active ? (
                <button
                  className="btn btn-error btn-sm "
                  onClick={handleActivation}
                >
                  Disable
                </button>
              ) : (
                <button
                  className="btn btn-accent btn-sm "
                  onClick={handleActivation}
                >
                  Enable
                </button>
              )}
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
