/* eslint-disable react/prop-types */
// import React from "react";

import { useLoaderData, useRevalidator } from "react-router-dom";
import Headline from "./components/Headline";
import { useState } from "react";
import apiClient from "../../apis/interceptors/axios";

function TableRow({ user, handleUserBlock }) {
  return (
    <tr className="hover">
      <th>{user.id}</th>
      <td>{user?.name}</td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>{user?.role == "TUTR" ? "Tutor" : "Student"}</td>
      <td>
        {user.is_active ? (
          <button
            className="btn btn-error btn-xs"
            onClick={() => handleUserBlock(user)}
          >
            Disable
          </button>
        ) : (
          <button
            className="btn btn-primary btn-xs"
            onClick={() => handleUserBlock(user)}
          >
            Enable
          </button>
        )}
      </td>
    </tr>
  );
}

const UserManage = () => {
  // const navigation = useNavigation();
  const revalidator = useRevalidator();
  const data = useLoaderData();
  const [modal, setModal] = useState(null);

  function openModal(user) {
    document.getElementById("my_modal_2").showModal();
    setModal(user);
  }
  async function hanndleUserBlock(user) {
    try {
      const res = await apiClient.post(
        `/myadmin/users/${user.id}/toggle_activation/`
      );
      console.log(res);
      document.getElementById("my_modal_2").close();
      revalidator.revalidate();
    } catch (error) {
      console.log(error);
    }
  }
  console.log(data);
  return (
    <>
      <Headline headline={"User Manage"} />
      <div className="h-dvh overflow-x-auto w-11/12 mx-auto">
        <table className="h-4/6 table table-pin-rows">
          {/* head */}
          <thead>
            <tr>
              <th>id</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <TableRow key={user.id} user={user} handleUserBlock={openModal} />
            ))}
          </tbody>
        </table>
      </div>
      <Modal data={modal} handleUserBlock={hanndleUserBlock} />
    </>
  );
};

function Modal({ data, handleUserBlock }) {
  console.log(data);
  return (
    <>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Block User {data?.username}</h3>
          {data?.is_active ? (
            <p className="py-4 text-center">
              Are you sure to Block User {data?.name}
            </p>
          ) : (
            <p className="py-4 text-center">
              Are you sure to Unblock User {data?.name}
            </p>
          )}

          <div className="flex flex-row justify-end gap-4">
            <button
              onClick={() => document.getElementById("my_modal_2").close()}
            >
              Cancel
            </button>
            {data?.is_active ? (
              <button
                className="btn btn-error btn-sm"
                onClick={() => handleUserBlock(data)}
              >
                Block
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleUserBlock(data)}
              >
                Unblock
              </button>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            type="button"
            onClick={() => document.getElementById("my_modal_2").close()}
          >
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}

export default UserManage;
