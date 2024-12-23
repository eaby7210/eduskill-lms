/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import AdminApp from "../AdminApp.jsx";
import Error from "../assets/Error.jsx";

const NewCourse = lazy(() => import("../assets/tutor/NewCourse.jsx"));
import { InitialLoad } from "./services/apiUser.js";
import {
  getCourse,
  getCourseList,
  getTutorCourseModules,
  getTutorCourses,
  postCourse,
  tutorDashboard,
  updateCourse,
} from "./services/apiCourses.js";
const CourseForm = lazy(() => import("../assets/tutor/CourseForm.jsx"));
import { adminDashboard, getCourses, getUsers } from "./services/apiAdmin.js";

const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Signup = lazy(() => import("../pages/Signup.jsx"));
const UserProfile = lazy(() => import("../pages/UserPage.jsx"));
const CourseList = lazy(() => import("../pages/Course_List.jsx"));

const Dashboard = lazy(() => import("../assets/admin/Dashboard.jsx"));
const UserManage = lazy(() => import("../assets/admin/UserManage.jsx"));
const CourseManage = lazy(() => import("../assets/admin/CourseManage.jsx"));

const TDashboard = lazy(() => import("../assets/tutor/Dashboard.jsx"));
const Courses = lazy(() => import("../assets/tutor/Courses.jsx"));
const CoursePage = lazy(() => import("../assets/tutor/CoursePage.jsx"));
const CoursePageForm = lazy(() => import("../assets/tutor/CoursePageForm.jsx"));
const Curriculum = lazy(() => import("../assets/tutor/Curriculum.jsx"));
const Publish = lazy(() => import("../assets/tutor/Publish.jsx"));

const router = createBrowserRouter([
  {
    element: <App />,
    loader: InitialLoad,
    errorElement: <Error />,

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
        path: "/become_tutor",
        lazy: () => import("../pages/BTutor.jsx"),
      },
      {
        path: "/confirm_email/:key",
        lazy: () => import("../pages/ConfirmEmail.jsx"),
        errorElement: <Error />,
      },
      {
        path: "/checkout",
        lazy: () => import("../pages/Checkout.jsx"),
      },
      {
        path: "/user/orders/:id",
        lazy: () => import("../assets/OrderDetails.jsx"),
      },
      {
        path: "/payment",
        lazy: () => import("../assets/Payment.jsx"),
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
        children: [
          // {
          //   path: "reviews",
          //   lazy: () => import("../assets/components/Reviews.jsx"),
          // },
        ],
      },
      {
        path: "/courses/:slug/learn/",
        lazy: () => import("../pages/CourseLearn.jsx"),
        errorElement: <Error />,
        children: [
          {
            path: "",
            lazy: () => import("../assets/components/Overview.jsx"),
          },
          {
            path: "reviews",
            lazy: () => import("../assets/components/Reviews.jsx"),
          },
          {
            path: "chat",
            lazy: () => import("../assets/Chat.jsx"),
            children: [
              {
                path: ":id",
                lazy: () => import("../assets/components/ChatMessages.jsx"),
              },
              {
                path: "community",
                lazy: () =>
                  import("../assets/components/ChatCourseMessage.jsx"),
              },
            ],
          },
        ],
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
            path: "notification",
            lazy: () => import("../assets/PurchaseHistory.jsx"),
          },
          {
            path: "settings",
            lazy: () => import("../assets/UserSettings.jsx"),
          },
        ],
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
            loader: adminDashboard,
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
          {
            path: "category",
            lazy: () => import("./../assets/admin/Category.jsx"),
          },
        ],
      },
      {
        path: "/tutor",
        element: (
          <Suspense fallback={<span>Loading...</span>}>
            <AdminApp />
          </Suspense>
        ),
        children: [
          {
            path: "",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <TDashboard />
              </Suspense>
            ),
            loader: tutorDashboard,
          },
          {
            path: "courses/",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <Courses />
              </Suspense>
            ),
            loader: getTutorCourses,
          },
          {
            path: "courses/:slug",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <CoursePage />
              </Suspense>
            ),
            action: updateCourse,
            loader: getCourse,
            children: [
              {
                path: "",
                element: (
                  <Suspense fallback={<span>Loading...</span>}>
                    <CoursePageForm />
                  </Suspense>
                ),
              },
              {
                path: "curriculum/",
                element: (
                  <Suspense fallback={<span>Loading...</span>}>
                    <Curriculum />
                  </Suspense>
                ),
                loader: getTutorCourseModules,
              },
              {
                path: "publish/",
                element: (
                  <Suspense fallback={<span>Loading...</span>}>
                    <Publish />
                  </Suspense>
                ),
              },
              {
                path: "chat",
                lazy: () => import("../assets/tutor/Chat.jsx"),
                children: [
                  {
                    path: ":id",
                    lazy: () => import("../assets/tutor/ChatMessages.jsx"),
                  },
                ],
              },
            ],
          },
          {
            path: "courses/new",
            element: (
              <Suspense fallback={<span>Loading...</span>}>
                <NewCourse />
              </Suspense>
            ),
            action: postCourse,
            children: [
              {
                path: "",
                element: (
                  <Suspense fallback={<span>Loading...</span>}>
                    <CourseForm />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
