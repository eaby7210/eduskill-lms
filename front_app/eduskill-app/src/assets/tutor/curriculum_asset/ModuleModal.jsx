/* eslint-disable react/prop-types */
// import React from "react";

import { useParams, useRevalidator } from "react-router-dom";
import apiClient from "../../../apis/interceptors/axios";
import { useContext, useState } from "react";
import { useErrorHandler } from "../../../hooks/Hooks";
import appContext from "../../../apis/Context";

export default function ModuleModal({ selectedModule, closeModuleModal }) {
  const handleError = useErrorHandler();
  const { addToast } = useContext(appContext);
  const [submitting, setSubmitting] = useState(false);
  const params = useParams();
  const revalidator = useRevalidator();
  console.log(selectedModule);
  async function handleModuleUpdate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const moduleData = {
        title: formData.get("title"),
        description: formData.get("description"),
      };
      const res = await apiClient.put(
        `/tutor/courses/${params.slug}/modules/${selectedModule.id}/`,
        moduleData
      );
      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeModuleModal();
        addToast({
          type: "success",
          message: "Module updated successfully",
        });
      }
    } catch (error) {
      handleError(error);
    }
    setSubmitting(false);
  }

  async function handleModuleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const moduleData = {
        title: formData.get("title"),
        description: formData.get("description"),
      };
      console.log(params);
      const res = await apiClient.post(
        `/tutor/courses/${params.slug}/modules/`,
        moduleData
      );
      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeModuleModal();
        addToast({
          type: "success",
          message: "Module created successfully",
        });
      }
    } catch (error) {
      handleError(error);
    }
    setSubmitting(false);
  }
  return (
    <div className="modal modal-open modal-bottom md:modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {selectedModule?.id
            ? `Edit Module ${selectedModule.title}`
            : "Add Module"}
        </h3>
        <form
          onSubmit={selectedModule ? handleModuleUpdate : handleModuleSubmit}
        >
          <div className="form-control mb-4">
            <label className="label">Module Title</label>
            <input
              type="text"
              name="title"
              className="input input-bordered"
              placeholder="Enter module title"
              defaultValue={selectedModule ? selectedModule.title : ""}
              required
            />
          </div>
          <div className="form-control mb-4">
            <label className="label">Module Description</label>
            <textarea
              name="description"
              className="textarea textarea-bordered"
              placeholder="Enter module description"
              defaultValue={selectedModule ? selectedModule.description : ""}
            ></textarea>
          </div>
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary px-6"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-dots loading-md"></span>{" "}
                  {"Saving..."}
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeModuleModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
