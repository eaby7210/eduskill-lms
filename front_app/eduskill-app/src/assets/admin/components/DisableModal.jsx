/* eslint-disable react/prop-types */

import { Form, useRevalidator } from "react-router-dom";
import apiClient from "../../../apis/interceptors/axios";
import { useErrorHandler } from "../../../hooks/Hooks";
import { useState } from "react";

const DisableModal = ({ closeDisable, selectedCategory }) => {
  const revalidator = useRevalidator();
  const handleError = useErrorHandler();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post(
        `/myadmin/category/${selectedCategory.id}/toggle_active/`
      );
      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeDisable();
      }
    } catch (error) {
      handleError(error);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <dialog open className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {selectedCategory.is_active ? "Disable" : "Enable"} Category
          </h3>
          <p className="py-4">
            Are you sure you want to{" "}
            {selectedCategory.is_active ? "disable" : "enable"} the category
            `&quot;`
            {selectedCategory.name}`&quot;`?
          </p>
          <Form method="post" onSubmit={handleSubmit}>
            <div className="modal-action">
              <button type="button" className="btn" onClick={closeDisable}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${
                  selectedCategory.is_active ? "btn-error" : "btn-success"
                }`}
                disabled={submitting}
              >
                {submitting
                  ? "Processing..."
                  : selectedCategory.is_active
                  ? "Disable"
                  : "Enable"}
              </button>
            </div>
          </Form>
        </div>
      </dialog>
    </div>
  );
};

export default DisableModal;
