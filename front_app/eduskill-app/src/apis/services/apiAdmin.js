import apiClient from "../interceptors/axios";

async function getUsers() {
  const urlstr = `/myadmin/users/`;
  const res = await apiClient.get(urlstr);
  console.log(res);
  return res.data;
}
async function getCourses() {
  const urlstr = `myadmin/courses/`;
  const res = await apiClient.get(urlstr);
  return res.data;
}

export { getUsers, getCourses };
