import { useContext } from "react";
import appContext from "../../apis/Context";
import { useNavigation } from "react-router-dom";

const TOAST_TYPE_CLASSES = {
  error: "alert-error",
  success: "alert-success",
  info: "alert-info",
  warning: "alert-warning",
};

const Toast = () => {
  const navigation = useNavigation();
  const { toasts, removeToast, navigationState } = useContext(appContext);
  return (
    <div className="toast toast-end z-[1000]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${
            TOAST_TYPE_CLASSES[toast.type] || "alert-info"
          } shadow-lg animate-in slide-in-from-right`}
        >
          <span>{toast.message}</span>
          <div>
            <button
              className="btn btn-ghost btn-sm lg:btn-md font-bold md:text-lg"
              onClick={() => removeToast(toast.id)}
            >
              X
            </button>
          </div>
        </div>
      ))}
      {(navigation.state === "loading" ||
        navigationState.state === "loading") && (
        <div className="alert text-primary shadow-lg animate-in slide-in-from-right">
          <span className="loading loading-dots loading-md"></span>
          <span>
            {navigationState.message || "Loading"}{" "}
            {navigationState.progress > 0 && ` (${navigationState.progress}%)`}
          </span>
        </div>
      )}
    </div>
  );
};

export default Toast;
