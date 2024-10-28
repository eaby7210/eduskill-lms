import { redirect } from "react-router-dom";
import apiClient from "../interceptors/axios";
import store from "../redux/store";

async function getCourseList({ request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const ordering = url.searchParams.get("ordering");
  const search = url.searchParams.get("search");
  let queryParams = [
    search ? `search=${search}` : null,
    category ? `category=${category}` : null,
    ordering ? `ordering=${ordering}` : null,
  ]
    .filter((param) => param !== null)
    .join("&");

  // Build the URL string
  const urlstr = queryParams ? `/courses/?${queryParams}` : "/courses/";
  const res = await apiClient.get(urlstr);
  //   console.log(res);
  return res.data;
}

async function getCourse({ params }) {
  //   const url = new URL(request.url);
  const slug = params.slug;
  const urlstr = `/tutor/courses/${slug}`;
  const res = await apiClient.get(urlstr);
  //   console.log(urlstr);
  //   console.log(res.data);
  return res.data;
}

async function updateCourse({ params, request }) {
  const slug = params.slug;
  const user = store.getState().user;
  const formData = await request.formData();
  formData.append("teacher", user?.teacher_profile?.id);
  const urlstr = `/tutor/courses/${slug}/`;
  try {
    const res = await apiClient.put(urlstr, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(res);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
}

async function getTutorCourses() {
  const urlstr = `tutor/courses/`;
  const res = await apiClient.get(urlstr);

  return res.data;
}

async function postCourse({ request }) {
  const user = store.getState().user;
  const formData = await request.formData();
  const courseData = new FormData();
  courseData.append("title", formData.get("title"));
  courseData.append("description", formData.get("description"));
  courseData.append("category", formData.get("category"));
  courseData.append("syllabus", formData.get("syllabus"));
  courseData.append("duration", formData.get("duration"));
  courseData.append("price", formData.get("price"));
  courseData.append("requirements", formData.get("requirements"));
  courseData.append("learning_objectives", formData.get("learning_objectives"));
  courseData.append("target_audience", formData.get("target_audience"));
  courseData.append(
    "completion_certificate",
    formData.get("completion_certificate") ? true : false
  );
  courseData.append("teacher", user?.teacher_profile?.id);
  const thumbnail = formData.get("course_thumbnail");
  console.log(thumbnail);
  if (thumbnail && thumbnail.size > 0) {
    courseData.append("course_thumbnail", thumbnail);
  }
  try {
    const res = await apiClient.post("/tutor/courses/", courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return redirect(`/tutor/courses/${res.data.slug}/curriculum/`);
  } catch (error) {
    console.log(error.response.data);
    return error.response.data;
  }
}

async function getTutorCourseModules({ params }) {
  //   const url = new URL(request.url);
  const slug = params.slug;
  const urlstr = `/tutor/courses/${slug}/modules`;
  const res = await apiClient.get(urlstr);
  //   console.log(urlstr);
  console.log(res.data);
  return res.data;
}

export {
  getCourseList,
  postCourse,
  getTutorCourses,
  getCourse,
  getTutorCourseModules,
  updateCourse,
};
