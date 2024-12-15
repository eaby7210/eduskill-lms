import { useContext } from "react";
import appContext from "../apis/Context";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Utility function to extract meaningful error message
const extractErrorMessage = (error) => {
  // Axios error
  if (error.response) {
    if (Array.isArray(error.response.data)) {
      return error.response.data
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          // If item is an object
          if (typeof item === "object" && item !== null) {
            const entries = Object.entries(item);
            if (entries.length > 0) {
              return entries
                .map(([key, value]) => {
                  const formattedKey =
                    key.charAt(0).toUpperCase() + key.slice(1);
                  return `${formattedKey}: ${value}`;
                })
                .join(", ");
            }
          }

          return String(item);
        })
        .filter(Boolean)
        .join(", ");
    }
    if (error.response.data && error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data && error.response.data.detail) {
      return error.response.data.detail;
    }
    return error.response.data || error.response.statusText || "Server Error";
  }
  // Network Error or Request Setup Error
  else if (error.request) {
    return "No response received from server. Please check your network connection.";
  }
  // React Router Error
  else if (error.status) {
    switch (error.status) {
      case 404:
        return "Page not found";
      case 403:
        return "You do not have permission to access this resource";
      case 500:
        return "Internal server error";
      default:
        return error.statusText || "An unexpected error occurred";
    }
  }
  // React Error Boundary errors
  else if (error instanceof Error) {
    return error.message || "An unexpected error occurred";
  }

  // Fallback for any other type of error
  return "An unexpected error occurred";
};

// Determine error type for appropriate toast styling
const determineErrorType = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return "warning";
      case 401:
        return "error";
      case 403:
        return "error";
      case 404:
        return "warning";
      case 500:
        return "error";
      default:
        return "info";
    }
  }
  return "error";
};

export const useErrorHandler = () => {
  const { addToast } = useContext(appContext);

  return (error, customMessage = null) => {
    // Log the full error for debugging
    console.error("Detailed Error:", error);

    const errorMessage = customMessage || extractErrorMessage(error);

    const errorType = determineErrorType(error);

    addToast({
      type: errorType,
      message: errorMessage,
    });

    return error;
  };
};

export const useNavigationState = () => {
  const { navigationState, navigationDispatch } = useContext(appContext);

  const setIdle = (message, progress = 0) => {
    navigationDispatch({
      type: "IDLE",
      payload: { message, progress },
    });
  };

  const setLoading = (message, progress = 0) => {
    navigationDispatch({
      type: "LOADING",
      payload: { message, progress },
    });
  };

  const setSubmitting = (message, progress = 0) => {
    navigationDispatch({
      type: "SUBMITTING",
      payload: { message, progress },
    });
  };

  const setError = (message) => {
    navigationDispatch({
      type: "ERROR",
      payload: { message },
    });
  };

  return {
    ...navigationState,
    setIdle,
    setLoading,
    setSubmitting,
    setError,
  };
};

// Permission check hook to validate user access to routes
export const usePermissionCheck = () => {
  const { addToast } = useContext(appContext);
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  const checkPermission = (path = location.pathname, reverse = false) => {
    // Determine user's role and permission level
    console.log(path);
    const isAdmin = user?.is_superuser === true;
    const isTutor = !!user?.teacher_profile?.id;
    const isGeneralUser = !!user?.pk;

    // Check permission based on user type
    const hasPermission =
      (isAdmin && path.startsWith("/admin/")) ||
      (isTutor && path.startsWith("/tutor/")) ||
      (isGeneralUser && path.startsWith("/user/")) ||
      false;
    console.log(hasPermission);
    // Apply reverse logic if needed
    const finalPermission = reverse ? !hasPermission : hasPermission;
    console.log(finalPermission);
    // If no permission, redirect to appropriate page
    if (!finalPermission) {
      navigate(-1);
      addToast({
        type: "error",
        message: "You are not Authorized to this page ",
      });
    }

    return finalPermission;
  };

  return checkPermission;
};
