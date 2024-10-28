/* eslint-disable react/prop-types */

import { useParams } from "react-router-dom";
import apiClient from "../../../apis/interceptors/axios";

export default function DisableModal({ data, closeDisableModal }) {
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
    try {
      console.log(lessonUrl);
      console.log(moduleUrl);
      console.log(url);
      const res = await apiClient.post(url);
      if (res.status <= 200 && res.status < 300) {
        alert(
          `${typeHeading} is ${data.data.is_active ? "disabled" : "enabled"}`
        );
        closeDisableModal();
      }
    } catch (error) {
      console.log(error);
      alert("Error in toggling Activation");
    }
  }

  return (
    <>
      <div className="modal modal-open">
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
              <button className="btn btn-sm btn-error" onClick={handleToggle}>
                Disable
              </button>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={handleToggle}>
                Enable
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
