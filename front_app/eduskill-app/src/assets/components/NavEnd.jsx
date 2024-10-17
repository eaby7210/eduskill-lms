import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import User from "../svgs/User";
import ThemeBtn from "./ThemeBtn";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../../apis/redux/User/userSlice";
import { userLogOutApi } from "../../apis/services/apiUser";

const NavEnd = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleLogout() {
    await userLogOutApi();
    dispatch(userLogout());
    navigate("/login");
  }
  return (
    <>
      <div className="flex flex-row gap-5 mx-2 py-3">
        {user.is_superuser && <Link to="/admin">Admin</Link>}
        {user.teacher_profile?.id && <Link to="/tutor">Teacher</Link>}
        {user.student_profile?.id && <Link to="">My Learnings</Link>}
      </div>
      <div className="flex flex-row gap-5 mx-2">
        <ThemeBtn />
        {user?.pk && (
          <Link
            to="/profile"
            className="tooltip tooltip-bottom"
            data-tip={user?.username}
          >
            <User />
          </Link>
        )}
      </div>
      {user.username ? (
        <a
          className="btn btn-outline btn-error btn-sm mx-3"
          onClick={handleLogout}
        >
          Logout
        </a>
      ) : (
        <div className="flex gap-1">
          {location.pathname !== "/login" && (
            <NavLink to="/login" className="btn btn-accent btn-sm ">
              Login
            </NavLink>
          )}
          {location.pathname !== "/signup" && (
            <NavLink to="/signup" className="btn btn-outline btn-info btn-sm ">
              Signup
            </NavLink>
          )}
        </div>
      )}
    </>
  );
};

export default NavEnd;
