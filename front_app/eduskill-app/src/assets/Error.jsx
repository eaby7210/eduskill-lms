// import React from "react";

import { useRouteError } from "react-router-dom";

const Error = () => {
  const error = useRouteError();
  console.log(error);
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1>Error {error.status}</h1>
      <p>{error.statusText}</p>
      <p>{error.data}</p>
    </div>
  );
};

export default Error;
