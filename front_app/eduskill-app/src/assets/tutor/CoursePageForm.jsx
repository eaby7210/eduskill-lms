import { useContext } from "react";
import { Form, useNavigation, useOutletContext } from "react-router-dom";
import appContext from "../../apis/Context";
import CourseActiveModal from "./curriculum_asset/CourseActiveModal";

export default function CoursePageForm() {
  const { actionData, courseData } = useOutletContext();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const course = courseData;
  const categories = useContext(appContext).appState.categories;
  function openCourseModal() {
    document.getElementById("my_modal_1").showModal();
  }
  return (
    <>
      <div className="w-10/12 mx-auto my-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Course Details</h2>
          {course.is_active ? (
            <button
              className="btn btn-sm w-1/6 btn-error"
              onClick={() => openCourseModal(null)}
            >
              Disable
            </button>
          ) : (
            <button
              className="btn btn-md w-1/6 btn-accent"
              onClick={() => openCourseModal(null)}
            >
              Enable
            </button>
          )}
        </div>
        <Form method="post" className="space-y-4" encType="multipart/form-data">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Course Title</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter course title"
              className="input input-bordered"
              defaultValue={course?.title || ""}
              required
            />
            {actionData?.title && (
              <span className="text-red-500">{actionData?.title[0]}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              placeholder="Enter course description"
              className="textarea textarea-bordered"
              rows="4"
              defaultValue={course?.description || ""}
            />
            {actionData?.description && (
              <span className="text-red-500">{actionData?.description[0]}</span>
            )}
          </div>

          {/* Category */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              name="category"
              className="select select-bordered"
              defaultValue={course?.category || ""}
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) =>
                category?.subcategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Syllabus */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Syllabus</span>
            </label>
            <textarea
              name="syllabus"
              placeholder="Enter course syllabus"
              className="textarea textarea-bordered"
              rows="4"
              defaultValue={course?.syllabus || ""}
            />
          </div>

          {/* Duration */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Duration (in hours)</span>
            </label>
            <input
              type="number"
              name="duration"
              min="1"
              placeholder="Enter duration"
              className="input input-bordered"
              defaultValue={course?.duration || ""}
              required
            />
          </div>

          {/* Price */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Price</span>
            </label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              placeholder="Enter price"
              className="input input-bordered"
              defaultValue={course?.price || ""}
              required
            />
          </div>

          {/* Course Thumbnail */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Course Thumbnail</span>
              {""}
              {course?.course_thumbnail && (
                <a
                  className="link-info"
                  href={course?.course_thumbnail}
                  target="_blank"
                >
                  Current Thumbnail
                </a>
              )}
            </label>
            <input
              type="file"
              name="course_thumbnail"
              accept="image/*"
              className="file-input file-input-bordered"
            />
          </div>

          {/* Requirements */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Requirements</span>
            </label>
            <textarea
              name="requirements"
              placeholder="Enter requirements (optional)"
              className="textarea textarea-bordered"
              rows="2"
              defaultValue={course?.requirements || ""}
            />
          </div>

          {/* Learning Objectives */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Learning Objectives</span>
            </label>
            <textarea
              name="learning_objectives"
              placeholder="Enter learning objectives (optional)"
              className="textarea textarea-bordered"
              rows="2"
              defaultValue={course?.learning_objectives || ""}
            />
          </div>

          {/* Target Audience */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Target Audience</span>
            </label>
            <input
              type="text"
              name="target_audience"
              placeholder="Who is this course for?"
              className="input input-bordered"
              defaultValue={course?.target_audience || ""}
            />
          </div>

          {/* Completion Certificate */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Completion Certificate</span>
              <input
                type="checkbox"
                name="completion_certificate"
                className="toggle"
                defaultChecked={course?.completion_certificate || false}
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="form-control">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-dots loading-md"></span>{" "}
                  {"Saving..."}
                </>
              ) : (
                "Save Course"
              )}
            </button>
          </div>
        </Form>
      </div>

      <CourseActiveModal
        courseSlug={course.slug}
        is_active={course.is_active}
      />
    </>
  );
}
