/* eslint-disable react/prop-types */

// import React from 'react'
export default function ModuleList({ module, index }) {
  //   console.log(module);

  return (
    <>
      <div className="my-7 w-full">
        <div className="collapse collapse-plus rounded-sm  ">
          <input type="radio" name="modules" className=" " />
          <h3 className=" collapse-title text-xl border-b-2 border-slate-200">
            {index + 1}. {module.title}
          </h3>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {/* Module ID */}
              <div>
                <h4 className="font-semibold text-lg">Module ID:</h4>
                <p>{module.id}</p>
              </div>

              {/* Module Description */}
              <div>
                <h4 className="font-semibold text-lg">Description:</h4>
                <p>{module.description || "No description provided"}</p>
              </div>

              {/* Module Duration */}
              <div>
                <h4 className="font-semibold text-lg">Duration:</h4>
                <p>
                  {module.duration
                    ? `${module.duration} hours`
                    : "Not specified"}
                </p>
              </div>

              {/* Module Active Status */}
              <div>
                <h4 className="font-semibold text-lg">Status:</h4>
                <p>{module.is_active ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row py-2 mt-3">
          <div className="divider divider-horizontal divider-start">
            Lessons:
          </div>
          <div className="flex flex-col py-4 my-4 w-full">
            {module.lessons.map((lesson, index) => (
              <LessonItem key={lesson.id} index={index} lesson={lesson} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LessonItem({ lesson, index }) {
  console.log(lesson);
  return (
    <>
      <div className="collapse collapse-plus border-slate-200 rounded-sm">
        <input type="radio" name="lessons" />
        <p className="collapse-title py-1 text-center">
          {index + 1}. {lesson.title}
        </p>
        <div className="collapse-content">
          <div className="card bg-base-100 shadow-md p-4">
            {/* Lesson Title */}
            <h3 className="font-bold text-lg mb-2">{lesson.title}</h3>

            {/* Lesson Description */}
            <p className="text-gray-600 mb-2">
              <strong>Description:</strong>{" "}
              {lesson.description || "No description available"}
            </p>

            {/* Lesson Content */}
            <div className="mb-2">
              <h3 className="font-bold">Content:</h3>
              {lesson.lesson_type === "video" && (
                <video
                  className="w-full md:w-1/2"
                  src={lesson.video_content?.video_file}
                  controls
                ></video>
              )}
              {lesson.lesson_type === "text" && (
                <p>
                  {lesson.text_content?.content || "No text content provided"}
                </p>
              )}
            </div>

            {/* Lesson Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Lesson Duration */}
              <div>
                <h4 className="font-semibold">Duration:</h4>
                <p>
                  {lesson.duration
                    ? `${lesson.duration} hours`
                    : "Not specified"}
                </p>
              </div>

              {/* Active Status */}
              <div>
                <h4 className="font-semibold">Status:</h4>
                <p>{lesson.is_active ? "Active" : "Inactive"}</p>
              </div>

              {/* Free Access */}
              <div>
                <h4 className="font-semibold">Free Access:</h4>
                <p>{lesson.is_free ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
