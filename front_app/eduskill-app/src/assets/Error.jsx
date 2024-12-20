import { useRouteError, useNavigate } from "react-router-dom";
import { useErrorHandler } from "../hooks/Hooks";
import { useEffect } from "react";

const Error = () => {
  const error = useRouteError();
  const handleError = useErrorHandler();
  const navigate = useNavigate();

  useEffect(() => {
    handleError(error);
  }, [error, handleError]);

  const getErrorMessage = () => {
    if (error.status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (error.status === 403) {
      return "You don't have permission to access this resource.";
    }
    if (error.status === 401) {
      return "Please log in to access this page.";
    }
    if (error.status >= 500) {
      return "Something went wrong on our end. Please try again later.";
    }
    return (
      error.data?.message || error.statusText || "An unexpected error occurred."
    );
  };

  const getErrorTitle = () => {
    if (error.status === 404) return "Page Not Found";
    if (error.status === 403) return "Access Denied";
    if (error.status === 401) return "Authentication Required";
    if (error.status >= 500) return "Server Error";
    return "Error Occurred";
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error mb-2">{getErrorTitle()}</h2>
          {error.status && (
            <div className="text-6xl font-bold text-error mb-4">
              Error {error.status}
            </div>
          )}
          <p className="mb-6 text-base-content/70">{getErrorMessage()}</p>
          <div className="card-actions justify-center space-x-2">
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/")}>
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
