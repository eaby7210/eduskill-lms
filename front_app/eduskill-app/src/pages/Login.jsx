/* eslint-disable react-hooks/exhaustive-deps */
// import React from "react";

import { useEffect, useState } from "react";
import { userLoginApi } from "../apis/services/apiUser";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../apis/redux/User/userSlice";
import { usePermissionCheck } from "../hooks/Hooks";

const Login = () => {
  const checkPermission = usePermissionCheck();
  useEffect(() => {
    checkPermission("/user/", true);
  }, []);

  const [isloading, setLoading] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    const isEmail = form.identifier.includes("@");
    const loginData = isEmail
      ? { email: form.identifier, password: form.password }
      : { username: form.identifier, password: form.password };
    const res = await userLoginApi(loginData);
    // setForm({ identifier: "", password: "" });
    if (parseInt(res.status / 100) != 2) {
      setErrors(res.res);
    } else {
      localStorage.setItem("access_token", res.res.access);
      dispatch(setUser(res.res.user));
      navigate("/");
    }
    setLoading(false);
  }
  return (
    <section className="grid justify-items-center my-9">
      <h1 className="text-center text-primary font-bold text-4xl py-2">
        Login
      </h1>
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <form className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email or Username</span>
            </label>
            <input
              type="text"
              value={form.identifier}
              onChange={(e) =>
                setForm((state) => {
                  return {
                    ...state,
                    identifier: e.target.value,
                  };
                })
              }
              placeholder="email or username"
              className="input input-bordered"
              required
            />
            {errors?.non_field_errors &&
              errors.non_field_errors.map((error, index) => (
                <label className="label" key={index}>
                  <span className="label-text text-center text-red-600">
                    {error}
                  </span>
                </label>
              ))}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="password"
              className="input input-bordered"
              value={form.password}
              onChange={(e) =>
                setForm((state) => {
                  return {
                    ...state,
                    password: e.target.value,
                  };
                })
              }
              required
            />
            {errors?.password &&
              errors.password.map((error, index) => (
                <label className="label" key={index}>
                  <span className="label-text text-center text-red-600">
                    {error}
                  </span>
                </label>
              ))}
          </div>
          <div className="form-control mt-6">
            <label className="label">
              <a href="#" className="label-text-alt link link-hover">
                Forgot password?
              </a>
            </label>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleLogin}
            >
              {isloading ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
