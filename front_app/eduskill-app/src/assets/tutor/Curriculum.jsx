// import React from 'react'

import { useState } from "react";
import ModuleCard from "./curriculum_asset/ModuleCard";
import ModuleModal from "./curriculum_asset/ModuleModal";
import LessonModal from "./curriculum_asset/LessonModal";
import DisableModal from "./curriculum_asset/disableModal";
import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "react-router-dom";
import apiClient from "../../apis/interceptors/axios";

export default function Curriculum() {
  const modules = useLoaderData();
  const { courseData } = useOutletContext();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const course = courseData;
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [disableModalData, setDisableModalData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  async function handlePublish() {
    const urlStr = `/tutor/courses/${course.slug}/publish/`;
    try {
      const res = await apiClient.post(urlStr);
      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        alert("Course Published");
        navigate(`/tutor/courses/${course.slug}/`);
      }
    } catch (error) {
      console.log(error.response);
      alert("Error in Publishing");
    }
  }

  //Modules
  const openModuleModal = (module = null) => {
    if (module != null) {
      setSelectedModule(module);
    }
    setIsModuleModalOpen(true);
  };
  const closeModuleModal = () => {
    setIsModuleModalOpen(false);
    setSelectedModule(null);
    revalidator.revalidate();
  };

  //lessons
  const openLessonModal = (lesson = null, module = null) => {
    setSelectedLesson(module ? { module: module } : lesson);
    setIsLessonModalOpen(true);
  };
  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setSelectedLesson(null);
    revalidator.revalidate();
  };

  //disable
  const openDisableModal = (module = null, lesson = null) => {
    if (module != null) {
      setDisableModalData({ type: "module", data: module });
    } else if (lesson != null) {
      setDisableModalData({ type: "lesson", data: lesson });
    }
  };
  const closeDisableModal = () => {
    setDisableModalData(null);
    revalidator.revalidate();
  };
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Curriculum</h2>
        <button
          className="btn btn-primary"
          onClick={() => openModuleModal(null)}
        >
          Add Module
        </button>
      </div>
      {/* Module List */}
      <div>
        {modules.length > 0 ? (
          modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              openLessonModal={openLessonModal}
              openModuleModal={openModuleModal}
              openDisableModal={openDisableModal}
            />
          ))
        ) : (
          <p>No modules added yet.</p>
        )}

        {modules.length > 0 && (
          <>
            {course.status === "draft" ? (
              <button
                className="btn btn-accent w-full text-xl"
                onClick={handlePublish}
              >
                Publish Course
              </button>
            ) : course.status === "published" ? (
              <p>Course is published to public</p>
            ) : course.status === "pending_approval" ? ( // Fixed this condition
              <p>Requested for Approval</p>
            ) : (
              ""
            )}
          </>
        )}
      </div>
      {/* Module Modal */}
      {isModuleModalOpen && (
        <ModuleModal
          selectedModule={selectedModule}
          closeModuleModal={closeModuleModal}
        />
      )}
      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <LessonModal
          selectedLesson={selectedLesson ? selectedLesson : null}
          closeLessonModal={closeLessonModal}
        />
      )}
      {disableModalData != null && (
        <DisableModal
          data={disableModalData}
          closeDisableModal={closeDisableModal}
        />
      )}
    </div>
  );
}
