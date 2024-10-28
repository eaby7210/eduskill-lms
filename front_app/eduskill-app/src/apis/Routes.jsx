/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import AdminApp from "../AdminApp.jsx";
import Error from "../assets/Error.jsx";
import TDashboard from "../assets/tutor/Dashboard.jsx";
import Courses from "../assets/tutor/Courses.jsx";
import NewCourse from "../assets/tutor/NewCourse.jsx";

import { InitialLoad } from "./services/apiUser.js";
import {
  getCourse,
  getCourseList,
  getTutorCourseModules,
  getTutorCourses,
  postCourse,
  updateCourse,
} from "./services/apiCourses.js";
import CourseForm from "../assets/tutor/CourseForm.jsx";
import CoursePage from "../assets/tutor/CoursePage.jsx";
import CoursePageForm from "../assets/tutor/CoursePageForm.jsx";
import Curriculum from "../assets/tutor/Curriculum.jsx";
import Publish from "../assets/tutor/Publish.jsx";
import { getCourses, getUsers } from "./services/apiAdmin.js";

const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Signup = lazy(() => import("../pages/Signup.jsx"));
const UserProfile = lazy(() => import("../pages/UserPage.jsx"));
const CourseList = lazy(() => import("../pages/Course_List.jsx"));

const Dashboard = lazy(() => import("../assets/admin/dashboard.jsx"));
const UserManage = lazy(() => import("../assets/admin/UserManage.jsx"));
const CourseManage = lazy(() => import("../assets/admin/CourseManage.jsx"));

const router = createBrowserRouter([
  {
    element: <App />,
    loader: InitialLoad,

    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<span>Loading...</span>}>
            <Home />
          </Suspense>
        ),
        errorElement: <Error />,
      },
      {
        path: "/login/",
        element: (
          <Suspense fallback={<span>Loading...</span>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <Suspense fallback={<span>Loading...</span>}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: "/user",
        element: (
          <Suspense fallback={<span>Loading...</span>}>
            <UserProfile />
          </Suspense>
        ),
        children: [
          {
            path: "",
            lazy: () => import("../assets/UserDashboard.jsx"),
          },
          {
            path: "mylearning",
            lazy: () => import("../assets/MyLearning.jsx"),
          },
          {
            path: "wishlist",
            lazy: () => import("../assets/Wishlist.jsx"),
          },

          {
            path: "cart",
            lazy: () => import("../assets/Cart.jsx"),
          },
          {
            path: "orders",
            lazy: () => import("../assets/PurchaseHistory.jsx"),
          },
          {
            path: "settings",
            lazy: () => import("../assets/UserSettings.jsx"),
          },
        ],
      },
      {
        path: "/courses",
        element: (
          <Suspense fallback={<span>Loading...</span>}>
            <CourseList />
          </Suspense>
        ),
        errorElement: <Error />,
        loader: getCourseList,
      },
      {
        path: "/courses/:slug/",
        lazy: () => import("../pages/CourseP.jsx"),
        errorElement: <Error />,
      },
      {
        path: "/admin",
        element: <AdminApp />,
        children: [
          {
            path: "",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "users/",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <UserManage />
              </Suspense>
            ),
            loader: getUsers,
          },
          {
            path: "courses/",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <CourseManage />
              </Suspense>
            ),
            loader: getCourses,
          },
          {
            path: "courses/:id",
            lazy: () => import("./../assets/admin/CoursePage.jsx"),
          },
        ],
      },
      {
        path: "/tutor",
        element: <AdminApp />,
        children: [
          {
            path: "",
            element: <TDashboard />,
          },
          {
            path: "courses/",
            element: <Courses />,
            loader: getTutorCourses,
          },
          {
            path: "courses/:slug",
            element: <CoursePage />,
            action: updateCourse,
            loader: getCourse,
            children: [
              {
                path: "",
                element: <CoursePageForm />,
                loader: getCourse,
              },
              {
                path: "curriculum/",
                element: <Curriculum />,
                loader: getTutorCourseModules,
              },
              {
                path: "publish/",
                element: <Publish />,
              },
            ],
          },
          {
            path: "courses/new",
            element: <NewCourse />,
            action: postCourse,
            children: [
              {
                path: "",
                element: <CourseForm />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
