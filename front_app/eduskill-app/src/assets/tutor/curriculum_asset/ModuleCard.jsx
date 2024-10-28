/* eslint-disable react/prop-types */
// import React from 'react'

import LessonCard from "./LessonCard";

export default function ModuleCard({
  module,
  openLessonModal,
  openModuleModal,
  openDisableModal,
}) {
  return (
    <div className="card bg-base-300 shadow-lg mb-4">
      <div className="card-body">
        <div className="flex flex-row justify-between">
          <h3 className="card-title">{module.title}</h3>
          <div className="flex flex-col sm:flex-row justify-end align-middle gap-3">
            <button
              className="btn btn-sm btn-neutral"
              onClick={() => openModuleModal(module)}
            >
              Edit Module
            </button>
            {module.is_active ? (
              <button
                className="btn btn-sm btn-error"
                onClick={() => openDisableModal(module)}
              >
                Disable Module
              </button>
            ) : (
              <button
                className="btn btn-sm btn-accent"
                onClick={() => openDisableModal(module)}
              >
                Enable Module
              </button>
            )}
          </div>
        </div>
        <p>{module.description}</p>

        {/* Lessons List */}
        {module.lessons.length > 0 && (
          <LessonCard
            key={module.id}
            lessons={module.lessons}
            openLessonModal={openLessonModal}
            openDisableModal={openDisableModal}
          />
        )}
        <button
          className="btn btn-sm btn-secondary w-full md:w-10/12 lg:w-1/2 mx-auto "
          onClick={() => openLessonModal(null, module.id)}
        >
          Add Lesson
        </button>
      </div>
    </div>
  );
}
