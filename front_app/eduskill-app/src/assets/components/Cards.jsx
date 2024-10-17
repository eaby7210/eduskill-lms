/* eslint-disable react/prop-types */
// import React from 'react';

const CategoryCard = ({ title, content, btnTXT, btnLink }) => {
  return (
    <div className="card bg-base-100 w-80 shadow-xl">
      <div className="card-body flex flex-row justify-between">
        <div>
          <h2 className="card-title">{title}</h2>
          <p>
            {content}
            {btnLink}
          </p>
        </div>

        <div className="card-actions justify-end">
          <button className="btn btn-primary">{btnTXT}</button>
        </div>
      </div>
    </div>
  );
};

export { CategoryCard };
