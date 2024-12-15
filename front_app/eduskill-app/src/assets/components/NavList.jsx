// import React from "react";

import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import appContext from "../../apis/Context";

const NavList = () => {
  const categories = useContext(appContext).appState.categories;

  return (
    <>
      <li>
        <NavLink to="/courses">Courses</NavLink>
      </li>
      <li>
        <details>
          <summary>Categories</summary>
          <ul className="p-2 flex flex-col w-52">
            {categories.length > 0 && (
              <>
                {categories?.map((category) =>
                  category.subcategories.length > 0 ? (
                    <li key={category.id} className="dropdown dropdown-right">
                      <div tabIndex={0} role="button">
                        {category.name}
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                      >
                        {category.subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <Link to={`/courses/?category=${subcategory.id}`}>
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <a key={category.id}>{category.name}ss</a>
                  )
                )}
              </>
            )}
          </ul>
        </details>
      </li>
    </>
  );
};

export default NavList;
