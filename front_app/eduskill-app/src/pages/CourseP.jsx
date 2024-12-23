/* eslint-disable react-refresh/only-export-components */
// import React from 'react'

import { Link, useLoaderData, useNavigate } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
import Cart from "../assets/svgs/Cart";
import Heart from "../assets/svgs/Heart";
import { addCartItem, removeCartItem } from "../apis/redux/Cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { addItem, removeItem } from "../apis/redux/Wishlist/wishSlice";
import { useContext, useEffect, useState } from "react";
import { postCartItem, postWishItem } from "../apis/services/apiUser";
import { useErrorHandler } from "../hooks/Hooks";
import appContext from "../apis/Context";

export async function loader({ params }) {
  const urlStr = `/courses/${params.slug}/`;
  const res = await apiClient.get(urlStr);
  return res.data;
}

export function Component() {
  const user = useSelector((state) => state.user);
  const handleError = useErrorHandler();
  const { addToast } = useContext(appContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const course = useLoaderData();
  const wishList = useSelector((state) => state.wishList).wishList;
  const cart = useSelector((state) => state.cart.cart);
  const [isCartItem, setCartItem] = useState(false);
  const [isWishItem, setWishList] = useState(false);

  useEffect(() => {
    setCartItem(cart.some((cItem) => cItem.id === course.id));
    setWishList(wishList.some((wItem) => wItem.id === course.id));
  }, [cart, wishList, course.id]);

  async function handleEnroll() {
    try {
      if (user?.pk) {
        if (!course?.affected_price > 0) {
          const res = await apiClient.post(`/courses/${course?.slug}/enroll/`);
          if (res.status >= 200 && res.status < 300) {
            addToast({
              type: "success",
              message: res.data.message,
            });
            navigate(`/courses/${course?.slug}`);
          } else {
            handleCartItem();
            navigate("/checkout");
          }
        }
      } else {
        throw { message: "Login to Enroll a course" };
      }
    } catch (error) {
      handleError(error);
    }
  }
  async function handleCartItem() {
    try {
      await postCartItem(course.id);

      if (isCartItem) {
        dispatch(removeCartItem(course));
        setCartItem(false);
      } else {
        dispatch(addCartItem(course));
        setCartItem(true);
      }
    } catch (error) {
      handleError(error);
    }
  }

  async function handleWishItem() {
    try {
      await postWishItem(course.id);
      if (isWishItem) {
        dispatch(removeItem(course));
        setWishList(false);
      } else {
        dispatch(addItem(course));
        setWishList(true);
      }
    } catch (error) {
      handleError(error);
    }
  }

  async function getModules() {
    try {
      await apiClient("");
    } catch {
      alert("Error in getting modules");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure className="lg:w-1/3">
          <img
            src={
              course.course_thumbnail ||
              "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
            }
            alt={course.title}
            className="object-cover lg:h-72 h-52"
          />
        </figure>
        <div className="card-body lg:w-2/3">
          <h2 className="card-title text-4xl font-bold">{course?.title}</h2>
          <p className="text-lg mt-2">{course?.description}</p>
          <p className="text-lg font-semibold mt-2">
            Duration: {course?.duration} hours
          </p>
          <p className="text-lg font-semibold mt-2">
            Instructor: {course?.teacher_name || "N/A"}
          </p>

          {/* Pricing */}
          {!course?.date_enrolled && (
            <div className="mt-4 flex flex-col md:flex-row items-start justify-between">
              {course?.affected_price > 0 ? (
                <>
                  <p className="text-2xl font-bold">
                    ₹{" "}
                    {course?.discount_percent > 0
                      ? course?.affected_price
                      : course?.price}
                    {course?.discount_percent > 0 && (
                      <span className="line-through text-gray-500 ml-2">
                        ₹ {course?.price}
                      </span>
                    )}
                  </p>
                  {user?.pk && (
                    <div className="card-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={handleCartItem}
                      >
                        <Cart h={"h-7"} w={"w-7"} indicator={isCartItem} />{" "}
                        {isCartItem ? "Remove from Cart" : "Add to Cart"}
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={handleWishItem}
                      >
                        <Heart h={"h-7"} w={"w-7"} indicator={isWishItem} />{" "}
                        {isWishItem
                          ? "Remove from WishList"
                          : "Add to WishList"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-2xl font-bold">Free</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Button */}
      <div className="mt-6">
        {course?.date_enrolled ? (
          <Link
            to={`/courses/${course?.slug}/learn`}
            className="btn btn-accent w-full text-xl"
          >
            Go to Course
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            className="btn btn-accent w-full text-xl"
          >
            Enroll Now
          </button>
        )}
      </div>

      <div
        role="tablist"
        className="tabs tabs-bordered w-full my-3 tabs-xs md:tabs-md lg:tabs-lg"
      >
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Course Details"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content py-3">
          {/* Course Syllabus */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Syllabus</h3>
            <p className="text-lg">{course?.syllabus}</p>
          </div>

          {/* Learning Objectives */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Learning Objectives</h3>
            <p className="text-lg">{course?.learning_objectives}</p>
          </div>

          {/* Requirements */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Requirements</h3>
            <p className="text-lg">{course?.requirements}</p>
          </div>

          {/* Target Audience */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Target Audience</h3>
            <p className="text-lg">{course?.target_audience}</p>
          </div>

          {/* Completion Certificate */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Completion Certificate</h3>
            <p className="text-lg">
              {course?.completion_certificate ? "Available" : "Not Available"}
            </p>
          </div>
        </div>

        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          onClick={getModules}
          aria-label="Curriculum"
        />
        <div role="tabpanel" className="tab-content p-10">
          {course.modules.map((module) => (
            <details
              key={module.id}
              className="collapse collapse-arrow bg-base-100 shadow-lg rounded-lg my-2"
            >
              <summary className="collapse-title text-xl font-semibold text-primary">
                {module.title}
              </summary>
              <div className="collapse-content p-4">
                <h4 className="text-lg font-semibold mb-2 text-secondary">
                  Lessons:
                </h4>
                <ul className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="bg-base-200 p-3 rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-base text-accent">
                          {lesson.title}
                        </h5>
                        <span
                          className={`badge ${
                            lesson.lesson_type === "video"
                              ? "badge-primary"
                              : "badge-secondary"
                          }`}
                        >
                          {lesson.lesson_type === "video" ? "Video" : "Text"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">Description:</span>{" "}
                        {lesson.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
