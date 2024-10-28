/* eslint-disable react/prop-types */
// import React from 'react'

export default function LessonCard({
  lessons,
  openLessonModal,
  openDisableModal,
}) {
  return (
    <div className="collapse collapse-plus bg-base-100 w-full md:w-11/12 px-4 rounded mx-auto">
      <input type="radio" name="my-accordion-2" />

      <h4 className="collapse-title text-lg font-semibold">
        Lessons <span className="text-sm md:font-light">(click here)</span>
      </h4>

      <ul className="collapse-content list-decimal pl-4">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className=" mb-2 p-1 text-sm md:p-2 md:text-base border-b"
          >
            {lesson.title} - {lesson.lesson_type} -{" "}
            <a
              className="link link-secondary"
              onClick={() => openLessonModal(lesson)}
            >
              Edit Lesson
            </a>{" "}
            -{" "}
            {lesson.is_active ? (
              <a
                className="link link-error"
                onClick={() => openDisableModal(null, lesson)}
              >
                Disable Lesson
              </a>
            ) : (
              <a
                className="link link-accent"
                onClick={() => openDisableModal(null, lesson)}
              >
                Enable Lesson
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
