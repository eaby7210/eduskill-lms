import apiClient from "../interceptors/axios";

export async function getUser() {
  try {
    const res = await apiClient.get("/auth/user/");
    return res.data;
  } catch {
    //console.log(error);
    // return { status: error.response.status, res: error.response.data };
    return null;
  }
}

export async function userLoginApi(data) {
  try {
    const res = await apiClient.post("/auth/login/", data);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.status, res: error.response.data };
  }
}

export async function userSignupApi(data) {
  try {
    const res = await apiClient.post("/auth/register/", data);
    // console.log(res);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.response.status, res: error.response.data };
  }
}

export async function userLogOutApi() {
  try {
    const res = await apiClient.post("/auth/logout/");
    console.log(res);
    return { status: res.status, res: res.data };
  } catch (error) {
    return { status: error.response.status, res: error.response.data };
  }
}

export async function Categorylist() {
  try {
    const res = await apiClient.get("/category/");
    // console.log(res);

    return res.data;
  } catch (error) {
    const er = error.response.data ? error.response.data : "Error Occured";
    throw er;
    // return { status: error.response.status, res: error.response.data };
  }
}

export async function InitialLoad() {
  const category = await Categorylist();
  const user = await getUser();
  const res = { category, user };
  return res;
}
