/* eslint-disable react/prop-types */
// import React from 'react'

import { useState } from "react";
import apiClient from "../../../apis/interceptors/axios";
import { useParams, useRevalidator } from "react-router-dom";

export default function LessonModal({ selectedLesson, closeLessonModal }) {
  console.log(selectedLesson);
  const [lessonType, setLessonType] = useState(
    selectedLesson.lesson_type ? selectedLesson.lesson_type : "text"
  );
  const param = useParams();
  const revalidator = useRevalidator();

  async function handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("lesson_type", lessonType);
    const urlStr = `/tutor/courses/${param.slug}/modules/${selectedLesson.module}/lessons/${selectedLesson.id}/`;

    try {
      // Send the form data with the file upload to the API
      const res = await apiClient.put(urlStr, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Make sure the server processes it as form-data
        },
      });

      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeLessonModal();
        alert("Lesson Updated");
      } else {
        alert("Error in Module creation");
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Module creation");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("lesson_type", lessonType);
    const urlStr = `/tutor/courses/${param.slug}/modules/${selectedLesson.module}/lessons/`;
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    try {
      // Send the form data with the file upload to the API
      const res = await apiClient.post(urlStr, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Make sure the server processes it as form-data
        },
      });

      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeLessonModal();
        alert("Lesson created");
      } else {
        alert("Error in Module creation");
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Module creation");
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-5">
          {selectedLesson.id
            ? `Edit Lesson ${selectedLesson.title}`
            : "Add Lesson"}
        </h3>
        <div className="flex flex-row w-full gap-1 p-2 my-2 border rounded-lg">
          <label className="label " htmlFor="lessonType">
            <span className="label-text w-max">Select Lesson Type:</span>
          </label>
          <select
            id="lessonType"
            className="select select-accent w-full"
            value={lessonType}
            onChange={(e) => setLessonType(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
          </select>
        </div>
        <form
          onSubmit={selectedLesson.id ? handleUpdate : handleSubmit}
          encType="multipart/form-data"
        >
          <div className="form-control mb-4">
            <label className="label">Lesson Title</label>
            <input
              type="text"
              name="title"
              className="input input-bordered"
              placeholder="Enter lesson title"
              required
              defaultValue={selectedLesson.title ? selectedLesson.title : ""}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">Lesson Description</label>
            <textarea
              name="description"
              className="textarea textarea-bordered"
              placeholder="Enter lesson description"
              defaultValue={
                selectedLesson.description ? selectedLesson.description : ""
              }
            ></textarea>
          </div>
          {lessonType === "text" ? (
            <div className="form-control mb-4">
              <label className="label">Lesson Text Content</label>
              <textarea
                name="content"
                className="textarea textarea-bordered"
                placeholder="Enter lesson content"
                defaultValue={
                  selectedLesson.text_content
                    ? selectedLesson.text_content.content
                    : ""
                }
                required
              ></textarea>
            </div>
          ) : lessonType === "video" ? (
            <div className="form-control mb-4 space-y-2">
              <label className="label text-lg font-semibold text-base-content">
                Upload Video
              </label>
              {selectedLesson.video_content && (
                <div className="mt-4 space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    Current Video
                  </span>
                  <video
                    src={selectedLesson.video_content.video_file}
                    className="w-full max-w-md rounded-lg shadow-md border border-gray-300"
                    controls
                  ></video>
                </div>
              )}
              <input
                type="file"
                name="video_file"
                accept="video/*"
                className="file-input file-input-bordered w-full border border-gray-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary"
                required
              />
              <small className="text-sm text-gray-500">
                Only video files are accepted
              </small>
            </div>
          ) : (
            <span className="text-red-600">
              Please select a type for the lesson
            </span>
          )}

          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeLessonModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}