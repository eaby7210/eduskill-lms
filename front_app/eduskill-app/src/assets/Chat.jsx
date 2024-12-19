/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import apiClient from "../apis/interceptors/axios";
// Initialize dayjs relative time plugin
dayjs.extend(relativeTime);

export async function loader({ params }) {
  const res = await apiClient(`/user/chats/?course_slug=${params.slug}`);
  return res.data;
}

const ChatSelector = ({ chatRooms, onSelectRoom, activeRoom }) => {
  return (
    <ul className="menu bg-base-200 w-56 p-0 [&_li>*]:rounded-none">
      {chatRooms.map((room) => (
        <li key={room.id}>
          <a
            className={`flex flex-col p-3 hover:bg-base-300 rounded-lg transition-colors ${
              room.id === activeRoom ? "bg-base-300" : ""
            }`}
            onClick={() => onSelectRoom(room.id)}
          >
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-12">
                  <span className="text-xl">{room.teacher_name?.[0]}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold">{room.teacher_name}</span>
                <span className="text-sm opacity-75 truncate">
                  {room?.last_message?.content || "No messages yet"}
                </span>
                <span className="text-xs opacity-50">
                  {dayjs(room.updated_at).fromNow()} &quot; Unread:{" "}
                  {room.unread_count}
                </span>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

export const Component = () => {
  const chatRooms = useLoaderData();
  const { courseData } = useOutletContext();
  const navigate = useNavigate();

  const [activeRoom, setActiveRoom] = useState(null);
  const communityChatRoom = {
    id: chatRooms[0]?.id ? chatRooms[0].id + 1 : 1,
    course_title: courseData.title,
    teacher_name: "Community Chat",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message: null,
    unread_count: 0,
  };

  const allChatRooms = [...chatRooms, communityChatRoom];
  const handleRoomSelect = (roomId) => {
    setActiveRoom(roomId);
    navigate(`${roomId}`);
  };

  return (
    <div className="drawer lg:drawer-open h-[calc(100vh-4rem)]">
      <input id="chat-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-base-100">
        <div className="sticky top-0 flex items-center gap-2 bg-base-100 bg-opacity-90 px-4 py-2 backdrop-blur lg:hidden">
          <label htmlFor="chat-drawer" className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-6 w-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
          <div className="flex-1 font-bold">Chat</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Outlet context={{ courseData }} />
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="chat-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="w-80 min-h-full bg-base-200">
          <div className="sticky top-0 z-20 flex items-center gap-2 bg-base-200 px-4 py-2 font-bold text-lg border-b">
            Course Chat
          </div>
          <ChatSelector
            chatRooms={allChatRooms}
            onSelectRoom={handleRoomSelect}
            activeRoom={activeRoom}
          />
        </div>
      </div>
    </div>
  );
};
