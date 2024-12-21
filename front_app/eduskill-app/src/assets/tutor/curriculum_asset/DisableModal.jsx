/* eslint-disable react/prop-types */

import { useParams } from "react-router-dom";
import apiClient from "../../../apis/interceptors/axios";
import { useErrorHandler } from "../../../hooks/Hooks";
import { useContext, useState } from "react";
import appContext from "../../../apis/Context";

export default function DisableModal({ data, closeDisableModal }) {
  const handleError = useErrorHandler();
  const { addToast } = useContext(appContext);
  const [submitting, setSubmitting] = useState(false);
  const param = useParams();
  const typeHeading = data.type.charAt(0).toUpperCase() + data.type.slice(1);

  async function handleToggle() {
    const lessonUrl = `/tutor/courses/${param.slug}/modules/${data?.data.module}/lessons/${data?.data.id}/toggle_active/`;
    const moduleUrl = `/tutor/courses/${param.slug}/modules/${data?.data.id}/toggle_active/`;
    const url =
      data.type == "lesson"
        ? lessonUrl
        : data.type == "module"
        ? moduleUrl
        : null;
    setSubmitting(true);
    try {
      const res = await apiClient.post(url);
      if (res.status <= 200 && res.status < 300) {
        addToast({
          type: "success",
          message: `${typeHeading} is ${
            data.data.is_active ? "disabled" : "enabled"
          }`,
        });
        closeDisableModal();
      }
    } catch (error) {
      handleError(error);
    }
    setSubmitting(false);
  }

  return (
    <>
      <div className="modal modal-open modal-bottom md:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">{`${
            data.data.is_active ? "Disable" : "Enable"
          }  ${typeHeading} - ${data.data.title}`}</h3>
          <p>
            Are you sure to{" "}
            {`${data.data.is_active ? "disable" : "enable"} ${typeHeading} `}
          </p>
          <div className="modal-action">
            <button
              className="btn btn-sm btn-ghost"
              onClick={closeDisableModal}
            >
              close
            </button>
            {data?.data.is_active ? (
              <button
                className="btn btn-sm btn-error"
                onClick={handleToggle}
                disabled={submitting}
              >
                {submitting ? "Disabling..." : "Disable"}
              </button>
            ) : (
              <button
                className="btn btn-sm btn-primary"
                onClick={handleToggle}
                disabled={submitting}
              >
                {submitting ? "Enabling..." : "Enable"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
