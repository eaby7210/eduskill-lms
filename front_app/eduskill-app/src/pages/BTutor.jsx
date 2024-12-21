import { useState } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { useErrorHandler } from "../hooks/Hooks";
import apiClient from "../apis/interceptors/axios";

export function Component() {
  const [isloading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const handleError = useErrorHandler();
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);

      const res = await apiClient.post("/tutor/become_tutor/", formData);
      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        navigate("/tutor/");
      }
    } catch (error) {
      handleError(error);
    }
    setIsLoading(false);
  }
  return (
    <>
      <section className="grid justify-items-center  w-full">
        <h1 className="text-center text-primary font-bold text-4xl py-2">
          Become Tutor
        </h1>
        <div className="card bg-base-100 w-4/5 max-w-xl shrink-0 shadow-2xl">
          <form onSubmit={(e) => handleSubmit(e)} className="card-body">
            <div className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Qualification</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="Your Qualification"
                  className="input input-bordered "
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  name="bio"
                  placeholder="Biography"
                  className="input input-bordered h-36 p-3"
                  required
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                {isloading ? (
                  <span className="loading loading-dots loading-md"></span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
