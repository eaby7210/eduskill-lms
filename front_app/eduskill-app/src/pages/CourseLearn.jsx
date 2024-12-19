/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useMemo } from "react";
import { useLoaderData, Outlet, NavLink } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
import { useErrorHandler, useNavigationState } from "../hooks/Hooks";

export async function loader({ params }) {
  const res = await apiClient(`/courses/${params.slug}/`);
  return res.data;
}

const activeClasses = ({ isActive }) => (isActive ? "tab-active" : "");

const LessonContent = ({ lesson, onLessonComplete }) => {
  console.log("dfasdfasdf");
  const { setLoading, setIdle } = useNavigationState();
  const handleError = useErrorHandler();
  const [lessonDetails, setLessonDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!lesson) return;
      setLoading();
      try {
        await apiClient.post(`/user/lesson/${lesson.id}/lesson_started/`);

        const response = await apiClient.get(`/user/lesson/${lesson.id}/`);
        console.log("Lesson Details:", response.data);
        setLessonDetails(response.data);
        setIsLoading(false);
      } catch (error) {
        handleError(error);
      }
      setIsLoading(false);
      setIdle();
    };

    fetchLessonDetails();
  }, [lesson]);

  const handleLessonComplete = async () => {
    setLoading();
    try {
      const response = await apiClient.post(
        `/user/lesson/${lesson.id}/lesson_completed/`
      );
      console.log("Lesson Completed:", response.data);
      onLessonComplete && onLessonComplete(lesson);
    } catch (error) {
      handleError(error);
    } finally {
      setIdle();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Render lesson content based on type
  const renderLessonContent = () => {
    console.log(lesson);
    if (!lessonDetails) return <div>No lesson details available</div>;
    console.log(lesson.progress_status);
    console.log(lesson.progress_status !== "completed");
    switch (lessonDetails.lesson_type) {
      case "video":
        return (
          <div className="flex flex-col h-full">
            {lessonDetails.video_content ? (
              <div className="relative aspect-video bg-base-200 flex items-center justify-center">
                {/* Video Player */}
                <video
                  controls
                  className="max-w-full max-h-full"
                  src={lessonDetails.video_content.video_file}
                  poster={lessonDetails.video_content.thumbnail}
                  onEnded={handleLessonComplete}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Overlay for additional context */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-black/30 text-white">
                  <h2 className="text-xl font-bold">{lessonDetails.title}</h2>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>No video content available for this lesson</span>
              </div>
            )}

            {/* Lesson Description and Completion */}
            <div className="p-4 bg-base-100">
              <p className="text-base-content/70 mb-4">
                {lessonDetails.description}
              </p>

              {/* Resources Section */}
              {lessonDetails.resources && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Additional Resources
                  </h3>
                  <div className="space-x-2">
                    {JSON.parse(lessonDetails.resources).map(
                      (resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs btn-outline"
                        >
                          {resource.name}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

              {lesson.progress_status !== "completed" && (
                <button
                  onClick={handleLessonComplete}
                  className="btn btn-primary btn-sm"
                  disabled={lesson.progress_status == "completed"}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        );
      case "text":
        return (
          <div className="prose max-w-none p-6 bg-base-100">
            <h2 className="text-2xl font-bold mb-4">{lessonDetails.title}</h2>

            {/* Lesson Description */}
            <div className="mb-6">
              <p className="text-base-content/70">
                {lessonDetails.description}
              </p>
            </div>

            {/* Text Content */}
            {lessonDetails.text_content ? (
              <div
                className="lesson-content"
                dangerouslySetInnerHTML={{
                  __html:
                    lessonDetails.text_content.content ||
                    "No content available",
                }}
              ></div>
            ) : (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>No text content available for this lesson</span>
              </div>
            )}

            {/* Resources Section */}
            {lessonDetails.resources && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">
                  Additional Resources
                </h3>
                <div className="space-y-2">
                  {JSON.parse(lessonDetails.resources).map(
                    (resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        {resource.name}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {lessonDetails.progress_status !== "completed" && (
              <button
                onClick={handleLessonComplete}
                className="btn btn-primary btn-sm"
              >
                Mark as Completed
              </button>
            )}
          </div>
        );

      default:
        return (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Unsupported lesson type: {lessonDetails.lesson_type}</span>
          </div>
        );
    }
  };

  return <div className="h-full">{renderLessonContent()}</div>;
};

export function Component() {
  const courseData = useLoaderData();
  const [course, setCourse] = useState(courseData);
  const [currentModule, setCurrentModule] = useState(course.modules[0] || null);
  const [currentLesson, setCurrentLesson] = useState(
    currentModule?.lessons[0] || null
  );

  const handleLessonComplete = (completedLesson) => {
    // Update the lesson's progress status in the current module

    const updatedModules = course.modules.map((module) => {
      if (module.id === currentModule.id) {
        return {
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === completedLesson.id
              ? { ...lesson, progress_status: "completed" }
              : lesson
          ),
        };
      }
      return module;
    });

    // Update the course object with new modules
    setCourse((state) => {
      return { ...state, modules: updatedModules };
    });
    const isLastLesson = updatedModules.every((module) =>
      module.lessons.every((lesson) => lesson.progress_status === "completed")
    );

    if (isLastLesson) {
      const firstModule = updatedModules[0];
      const firstLesson = firstModule.lessons[0];
      setCurrentModule(firstModule);
      setCurrentLesson(firstLesson);
      return;
    }
    // Find and set the next uncompleted lesson if available
    const currentModuleIndex = updatedModules.findIndex(
      (m) => m.id === currentModule.id
    );
    let nextLesson = null;
    let nextModule = null;

    // Look for next uncompleted lesson in current module
    const remainingLessonsInModule = currentModule.lessons
      .slice(
        currentModule.lessons.findIndex((l) => l.id === completedLesson.id) + 1
      )
      .find((l) => l.progress_status !== "completed");

    if (remainingLessonsInModule) {
      nextLesson = remainingLessonsInModule;
      nextModule = currentModule;
    } else {
      // Look for next module with uncompleted lessons
      const nextModuleWithLessons = updatedModules
        .slice(currentModuleIndex + 1)
        .find((m) => m.lessons.some((l) => l.progress_status !== "completed"));

      if (nextModuleWithLessons) {
        nextModule = nextModuleWithLessons;
        nextLesson = nextModuleWithLessons.lessons.find(
          (l) => l.progress_status !== "completed"
        );
      }
    }

    // Update states if we found a next lesson
    if (nextLesson && nextModule) {
      setCurrentLesson(nextLesson);
      setCurrentModule(nextModule);
    }
  };

  const processedModules = useMemo(() => {
    return course.modules.map((module) => ({
      ...module,
      completedLessons: module.lessons.filter(
        (lesson) => lesson.progress_status === "completed"
      ).length,
    }));
  }, [course.modules]);

  const handleLessonSelect = (module, lesson) => {
    setCurrentModule(module);
    setCurrentLesson(lesson);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="drawer drawer-end lg:drawer-open flex-grow">
        <input
          id="course-modules-drawer"
          type="checkbox"
          className="drawer-toggle"
        />

        {/* Main Lesson Content */}
        <div className="drawer-content flex flex-col">
          {/* Lesson Content */}
          <div className="flex-grow p-4">
            <LessonContent
              lesson={currentLesson}
              onLessonComplete={() => handleLessonComplete(currentLesson)}
            />
          </div>

          {/* Drawer Toggle Button */}
          <label
            htmlFor="course-modules-drawer"
            className="drawer-button btn btn-primary lg:hidden m-4"
          >
            View Course Modules
          </label>
        </div>

        {/* Module Drawer */}
        <div className="drawer-side z-50">
          <label
            htmlFor="course-modules-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>

          <div className="menu bg-base-100 text-base-content min-h-full w-80 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-primary">
              {course.title}
            </h2>

            {processedModules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="collapse collapse-arrow bg-base-200 mb-2"
              >
                <input type="checkbox" />
                <div className="collapse-title flex justify-between items-center">
                  <span>
                    {moduleIndex}. {module.title}
                  </span>
                  <span className="badge badge-primary badge-sm">
                    {module.completedLessons}/{module.lessons.length}
                  </span>
                </div>

                <div className="collapse-content">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonSelect(module, lesson)}
                      className={`
                        p-2 hover:bg-base-300 cursor-pointer rounded 
                        ${
                          currentLesson?.id === lesson.id
                            ? "bg-primary text-primary-content"
                            : ""
                        }
                        ${
                          lesson.progress_status === "completed"
                            ? "line-through opacity-50"
                            : ""
                        }
                      `}
                    >
                      {lesson.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="bg-base-300 p-2">
        <div
          role="tablist"
          className="tabs tabs-bordered w-full tabs-md justify-center"
        >
          {[
            { to: "", label: "Overview" },

            { to: "reviews", label: "Reviews" },
            { to: "chat", label: "Discussion" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              role="tab"
              state={{ courseData: course }}
              className={({ isActive }) => `tab ${activeClasses({ isActive })}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Outlet for Tab Content */}
        <div className="mt-4">
          <Outlet context={{ courseData: course }} />
        </div>
      </div>
    </div>
  );
}
