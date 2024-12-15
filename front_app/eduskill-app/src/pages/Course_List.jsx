// import React from "react";

import { useContext } from "react";
import appContext from "../apis/Context";
import Radio from "../assets/components/Radio";
import { Form, useLoaderData, useNavigation } from "react-router-dom";
import CardSkelton from "../assets/components/CardSkelton";
import CourseCard from "../assets/components/CourseCard";

const CourseList = () => {
  const categories = useContext(appContext).appState.categories;
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const data = useLoaderData();
  // console.log(categories);
  return (
    <section className="container max-w-screen-2xl  mx-auto p-2">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center ">
          {/* Page content here */}

          <div className="flex items-center justify-between w-full mb-5">
            <h2 className="text-2xl font-bold flex-grow">Course List</h2>
            <label
              htmlFor="my-drawer-2"
              className="btn btn-sm md:btn-md  btn-primary drawer-button lg:hidden"
            >
              Filter
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-1 p-3">
            {isLoading
              ? [0, 0, 0, 0, 0, 0].map((item, index) => (
                  <CardSkelton key={index} />
                ))
              : data.map((item) => <CourseCard key={item.id} item={item} />)}
          </div>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 text-base-content gap-2 min-h-full w-72 p-4">
            <Form method="get" action="/courses">
              <li className="flex flex-row justify-end">
                <input
                  type="submit"
                  value="Apply"
                  className="btn btn-sm btn-accent m-2 py-0"
                />
              </li>
              <li>
                <label className="input input-info flex items-center w-11/12">
                  <input
                    type="text"
                    name="search"
                    className="grow"
                    placeholder="Search"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
              </li>
              <li className="flex flex-row">
                <select
                  name="ordering"
                  className="select select-ghost grow max-w-xs"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Ordering
                  </option>
                  <option value="title">Title order A-Z</option>
                  <option value="-title">Title order Z-A</option>
                  <option value="created_at">Latest</option>
                  <option value="-created_at">Oldest</option>
                </select>
              </li>
              <li>
                <details>
                  <summary>Categories</summary>
                  <div className="form-control">
                    <ul>
                      <li>
                        <Radio
                          name={"category"}
                          text={"None"}
                          value={""}
                          checked={true}
                        />
                      </li>
                      {categories && (
                        <>
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Radio
                                name={"category"}
                                text={category.name}
                                value={category.id}
                              />
                              {category.subcategories.length > 0 && (
                                <ul>
                                  {category.subcategories.map((category) => (
                                    <li key={category.id}>
                                      <Radio
                                        name={"category"}
                                        text={category.name}
                                        value={category.id}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </>
                      )}
                    </ul>
                  </div>
                </details>
              </li>
            </Form>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CourseList;
