/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
// import React from 'react'

import { useLoaderData } from "react-router-dom";
import apiClient from "../../apis/interceptors/axios";
import Headline from "./components/Headline";
import { useContext, useState } from "react";
import appContext from "../../apis/Context";
import CategoryAddModal from "./components/CategoryAddModal.jsx";
import DisableModal from "./components/DisableModal";
import { getCategory } from "../../apis/services/apiAdmin";
import { useNavigationState } from "../../hooks/Hooks";

export async function loader() {
  try {
    const res = await apiClient("/myadmin/category/");
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export function Component() {
  console.log(navigation);
  const categoryData = useLoaderData();
  const addToast = useContext(appContext).addToast;
  const [addModel, setAddModal] = useState(false);
  const [disableModal, setDisableModal] = useState(null);
  const [selectedCategory, setCategory] = useState(null);
  const [isloading, setIsLoading] = useState(false);
  const { setIdle, setLoading } = useNavigationState();
  function openAddModal() {
    setAddModal(true);
  }
  function closeAddModal() {
    setCategory(null);
    setAddModal(false);
  }

  async function editModal(id) {
    setIsLoading(true);
    setLoading();
    openAddModal();
    try {
      const res = await getCategory(id);
      setCategory(res);
    } catch (error) {
      addToast({
        type: "error",
        message: `Error while getting Category ${error.response.data.error}`,
      });
    }
    setIsLoading(false);
    setIdle();
  }

  async function openDisableModal(category) {
    setDisableModal(category);
  }
  function closeDisableModal() {
    setDisableModal(null);
  }

  return (
    <>
      <div className="flex justify-between w-11/12 mb-3">
        <Headline headline={"Course Manage"} />
        <button className="btn  btn-primary mx-1" onClick={openAddModal}>
          Add Category
        </button>
      </div>
      <div className="collapse bg-base-100">
        <input type="radio" name="category" defaultChecked />
        <h1 className="collapse-title text-2xl">Main Categories</h1>
        <div className="collapse-content w-10/12 mx-auto overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category) => (
                <MainCategory
                  key={category.id}
                  category={category}
                  openDisable={openDisableModal}
                  openEdit={editModal}
                />
              ))}
              {/* {courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))} */}
            </tbody>
          </table>
        </div>
      </div>

      <div className="collapse bg-base-100">
        <input type="radio" name="category" />
        <h1 className="collapse-title text-2xl">Sub Categories</h1>
        <div className="collapse-content w-10/12 mx-auto overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category) =>
                category.subcategories.map((subcategory) => (
                  <SubCategory
                    key={subcategory.id}
                    category={subcategory}
                    parent={category.name}
                    openDisable={openDisableModal}
                    openEdit={editModal}
                  />
                ))
              )}
              {/* {courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))} */}
            </tbody>
          </table>
        </div>
      </div>

      {addModel && (
        <CategoryAddModal
          selectedCategory={selectedCategory}
          closeAddModal={closeAddModal}
          categoryData={categoryData}
          loading={isloading}
        />
      )}
      {disableModal != null && (
        <DisableModal
          closeDisable={closeDisableModal}
          selectedCategory={disableModal}
        />
      )}
    </>
  );
}

function MainCategory({ category, openDisable, openEdit }) {
  return (
    <>
      <tr className="hover ">
        <th>{category.id}</th>
        <td>{category.name}</td>
        <td>
          {category.is_active ? (
            <button
              className="btn btn-sm btn-error mx-1"
              onClick={() => openDisable(category)}
            >
              Disable
            </button>
          ) : (
            <button
              className="btn btn-sm btn-accent mx-1"
              onClick={() => openDisable(category)}
            >
              Enable
            </button>
          )}
          <button
            className="btn btn-sm btn-accent mx-1"
            onClick={() => openEdit(category.id)}
          >
            Edit
          </button>
        </td>
      </tr>
    </>
  );
}

function SubCategory({ category, parent, openDisable, openEdit }) {
  return (
    <>
      <tr className="hover ">
        <th>{category.id}</th>
        <td>{category.name}</td>
        <td>{parent}</td>
        <td>
          {category.is_active ? (
            <button
              className="btn btn-sm btn-error mx-1"
              onClick={() => openDisable(category)}
            >
              Disable
            </button>
          ) : (
            <button
              className="btn btn-sm btn-accent mx-1"
              onClick={() => openDisable(category)}
            >
              Enable
            </button>
          )}
          <button
            className="btn btn-sm btn-accent mx-1"
            onClick={() => openEdit(category.id)}
          >
            Edit
          </button>
        </td>
      </tr>
    </>
  );
}
