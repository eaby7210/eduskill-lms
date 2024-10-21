// import React from 'react'

import { useState } from "react";
import { Form } from "react-router-dom";

export default function Curriculum() {
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const modules = [
    {
      id: 1,
      title: "Introduction to Programming",
      description:
        "This module covers the basics of programming and algorithms.",
      lessons: [
        {
          id: 1,
          title: "What is Programming?",
          description:
            "Learn the fundamentals of programming and its importance.",
          lesson_type: "text", // Text lesson
          content: "Content for the text lesson goes here.",
        },
        {
          id: 2,
          title: "Introduction to Python",
          description: "An introduction to Python programming language.",
          lesson_type: "video", // Video lesson
          content: "URL or file path to the video goes here.",
        },
      ],
    },
    {
      id: 2,
      title: "Advanced Python Concepts",
      description:
        "This module delves into advanced Python topics and libraries.",
      lessons: [
        {
          id: 3,
          title: "Object-Oriented Programming",
          description:
            "Understand the concept of OOP and how it applies to Python.",
          lesson_type: "text", // Text lesson
          content: "Content for OOP lesson goes here.",
        },
        {
          id: 4,
          title: "Working with Libraries",
          description:
            "Learn how to work with Python libraries such as NumPy and Pandas.",
          lesson_type: "video", // Video lesson
          content: "URL or file path to the library video goes here.",
        },
      ],
    },
    {
      id: 3,
      title: "Data Structures and Algorithms",
      description:
        "Explore essential data structures and algorithms used in software development.",
      lessons: [
        {
          id: 5,
          title: "Introduction to Data Structures",
          description:
            "Learn about different data structures such as arrays, lists, and trees.",
          lesson_type: "text", // Text lesson
          content: "Text content explaining data structures.",
        },
      ],
    },
  ];
  const openModuleModal = () => setIsModuleModalOpen(true);
  const closeModuleModal = () => setIsModuleModalOpen(false);

  const openLessonModal = (moduleId) => {
    setSelectedModule(moduleId);
    setIsLessonModalOpen(true);
  };

  const closeLessonModal = () => setIsLessonModalOpen(false);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Curriculum</h2>
        <button className="btn btn-primary" onClick={openModuleModal}>
          Add Module
        </button>
      </div>

      {/* Module List */}
      <div>
        {modules.length > 0 ? (
          modules.map((module) => (
            <div key={module.id} className="card bg-base-100 shadow-lg mb-4">
              <div className="card-body">
                <h3 className="card-title">{module.title}</h3>
                <p>{module.description}</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => openLessonModal(module.id)}
                >
                  Add Lesson
                </button>

                {/* Lessons List */}
                {module.lessons.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Lessons</h4>
                    <ul className="list-disc pl-4">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          {lesson.title} - {lesson.lesson_type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No modules added yet.</p>
        )}
      </div>

      {/* Module Modal */}
      {isModuleModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Module</h3>
            <Form method="post">
              <div className="form-control mb-4">
                <label className="label">Module Title</label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered"
                  placeholder="Enter module title"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">Module Description</label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  placeholder="Enter module description"
                ></textarea>
              </div>
              <input type="hidden" name="form_type" value="module" />
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModuleModal}
                >
                  Cancel
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Lesson</h3>
            <Form method="post" encType="multipart/form-data">
              <div className="form-control mb-4">
                <label className="label">Lesson Title</label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered"
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">Lesson Type</label>
                <select
                  name="lesson_type"
                  className="select select-bordered"
                  required
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">Lesson Description</label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  placeholder="Enter lesson description"
                ></textarea>
              </div>

              {/* Conditionally show content fields */}
              <div className="form-control mb-4">
                <label className="label">Lesson Content</label>
                <input
                  type="file"
                  name="content"
                  className="file-input file-input-bordered"
                  required
                />
              </div>

              <input type="hidden" name="module_id" value={selectedModule} />
              <input type="hidden" name="form_type" value="lesson" />

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
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
