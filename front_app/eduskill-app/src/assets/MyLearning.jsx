/* eslint-disable react-refresh/only-export-components */
import { Link, useLoaderData } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
import dayjs from "dayjs";

export async function loader() {
  const res = await apiClient("/courses/enrolled_list/");
  return res.data;
}

export function Component() {
  const enrolledCourses = useLoaderData();

  return (
    <div className="min-h-screen bg-base-200 p-5">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Learning</h1>
          <Link to="/profile" className="btn btn-primary">
            Profile Settings
          </Link>
        </div>

        {/* Enrolled Courses Section */}
        <div className="grid grid-cols-1 gap-6">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex gap-4">
                  <img
                    src={course.course_thumbnail}
                    alt={course.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h2 className="card-title text-primary">{course.title}</h2>
                    <p className="text-sm text-base-content mb-2">
                      Instructor: {course.teacher_name}
                    </p>
                    <p className="text-sm text-base-content mb-2">
                      Enrolled:{" "}
                      {dayjs(course.date_enrolled).format("MMMM D, YYYY")}
                    </p>

                    {/* Course Progress Bar */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex-1 mr-4">
                        <progress
                          className="progress progress-primary w-full"
                          value={course.progress}
                          max="100"
                        ></progress>
                      </div>
                      <span className="text-sm font-bold text-base-content whitespace-nowrap">
                        {course.progress}%
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="btn btn-secondary"
                      >
                        {course.progress === 100
                          ? "Review Course"
                          : "Continue Learning"}
                      </Link>
                      <div className="flex space-x-2">
                        <Link
                          to={`/courses/${course.slug}/chat`}
                          className="btn btn-outline btn-primary"
                        >
                          Course Chat
                        </Link>
                        <Link
                          to={`/courses/${course.slug}/reviews`}
                          className="btn btn-outline btn-primary"
                        >
                          Reviews
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
