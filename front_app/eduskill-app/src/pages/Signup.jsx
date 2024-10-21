import { useState } from "react";
import { userSignupApi } from "../apis/services/apiUser";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../apis/redux/User/userSlice";

const Signup = () => {
  const [isloading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [errors, setErrors] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // console.log(form);
    const res = await userSignupApi(form);
    if (parseInt(res.status / 100) != 2) {
      setErrors(res.res);
    } else {
      //   console.log(res.res);
      localStorage.setItem("access_token", res.res.access);
      localStorage.setItem("refresh_token", res.res.refresh);
      dispatch(setUser(res.res.user));
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <section className="grid justify-items-center  w-full">
      <h1 className="text-center text-primary font-bold text-4xl py-2">
        SignUp
      </h1>
      <div className="card bg-base-100 w-max max-w-xl shrink-0 shadow-2xl">
        <form className="card-body">
          <div className="flex fex-row gap-3">
            {/* First Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="input input-bordered"
              />
              {errors?.first_name &&
                errors.first_name.map((error, index) => (
                  <label className="label" key={index}>
                    <span className="label-text text-center text-red-600">
                      {error}
                    </span>
                  </label>
                ))}
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="input input-bordered"
                required
              />
              {errors?.last_name &&
                errors.last_name.map((error, index) => (
                  <label className="label" key={index}>
                    <span className="label-text text-center text-red-600">
                      {error}
                    </span>
                  </label>
                ))}
            </div>
          </div>
          <div className="flex fex-row gap-3">
            {/* Email */}
            <div className="form-control flex-grow">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="input input-bordered"
                required
              />
              {errors?.email &&
                errors.email.map((error, index) => (
                  <label className="label" key={index}>
                    <span className="label-text text-center text-red-600">
                      {error}
                    </span>
                  </label>
                ))}
            </div>
            {/* Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="input input-bordered"
                required
              />
              {errors?.username &&
                errors.username.map((error, index) => (
                  <label className="label" key={index}>
                    <span className="label-text text-center text-red-600">
                      {error}
                    </span>
                  </label>
                ))}
            </div>
          </div>
          {/* Password 1 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password1"
              value={form.password1}
              onChange={handleChange}
              placeholder="Password"
              className="input input-bordered"
              required
            />
            {errors?.password1 &&
              errors.password1.map((error, index) => (
                <label className="label" key={index}>
                  <span className="label-text text-center text-red-600">
                    {error}
                  </span>
                </label>
              ))}
          </div>

          {/* Password 2 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="input input-bordered"
              required
            />
            {errors?.password2 &&
              errors.password2.map((error, index) => (
                <label className="label" key={index}>
                  <span className="label-text text-center text-red-600">
                    {error}
                  </span>
                </label>
              ))}
            {errors?.non_field_errors &&
              errors.non_field_errors.map((error, index) => (
                <label className="label" key={index}>
                  <span className="label-text text-center text-red-600">
                    {error}
                  </span>
                </label>
              ))}
          </div>

          {/* Forgot Password */}
          <div className="form-control">
            <label className="label">
              <a href="#" className="label-text-alt link link-hover">
                Forgot password?
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              {isloading ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                "Signup"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Signup;
