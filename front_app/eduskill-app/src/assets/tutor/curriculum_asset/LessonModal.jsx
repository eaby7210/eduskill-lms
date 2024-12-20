/* eslint-disable react/prop-types */
// import React from 'react'

import { useContext, useState, useEffect } from "react";
import ReactHLsPlayer from "react-hls-player";
import apiClient from "../../../apis/interceptors/axios";
import { useParams, useRevalidator } from "react-router-dom";
import { useErrorHandler } from "../../../hooks/Hooks";
import appContext from "../../../apis/Context";

export default function LessonModal({ selectedLesson, closeLessonModal }) {
  console.log(selectedLesson);
  const handleError = useErrorHandler();
  const { addToast } = useContext(appContext);
  const [submitting, setSubtting] = useState(false);
  const [lessonType, setLessonType] = useState(
    selectedLesson.lesson_type ? selectedLesson.lesson_type : "text"
  );
  const [videoUrl, setVideoUrl] = useState(null);
  const param = useParams();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (selectedLesson.video_content?.hls) {
      // Create blob from HLS content
      const blob = new Blob([selectedLesson.video_content.hls], {
        type: "application/x-mpegURL",
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [selectedLesson.video_content]);

  const VideoPlayer = () => {
    if (!selectedLesson.video_content) return null;

    if (videoUrl) {
      return (
        <ReactHLsPlayer
          src={videoUrl}
          autoPlay={false}
          controls={true}
          width="100%"
          height="auto"
          className="rounded-lg"
        />
      );
    }

    return (
      <video
        controls
        className="w-full rounded-lg"
        src={selectedLesson.video_content.video_file}
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  async function handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("lesson_type", lessonType);
    const urlStr = `/tutor/courses/${param.slug}/modules/${selectedLesson.module}/lessons/${selectedLesson.id}/`;
    setSubtting(false);
    try {
      const res = await apiClient.put(urlStr, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeLessonModal();
        addToast({
          type: "success",
          message: "Lesson updated successfully",
        });
      } else {
        alert("Error in Module creation");
      }
    } catch (error) {
      handleError(error);
    }
    setSubtting(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("lesson_type", lessonType);
    const urlStr = `/tutor/courses/${param.slug}/modules/${selectedLesson.module}/lessons/`;
    setSubtting(true);
    try {
      const res = await apiClient.post(urlStr, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeLessonModal();
        addToast({
          type: "success",
          message: "Lesson created successfully",
        });
      } else {
        alert("Error in Module creation");
      }
    } catch (error) {
      handleError(error);
    }
    setSubtting(false);
  }

  return (
    <div className="modal modal-open modal-bottom md:modal-middle">
      <div className="modal-box man-w-3xl">
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
                  <div className="w-full max-w-md rounded-lg shadow-md border border-gray-300">
                    {selectedLesson.id &&
                      lessonType === "video" &&
                      selectedLesson.video_content && (
                        <>
                          <h4 className="font-semibold mb-2">Preview:</h4>
                          <VideoPlayer />
                        </>
                      )}
                  </div>
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
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
