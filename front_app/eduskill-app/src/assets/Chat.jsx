/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
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
            className={room.id === activeRoom ? "active" : ""}
            onClick={() => onSelectRoom(room.id)}
          >
            <div className="flex flex-col">
              <span className="font-bold">{room?.teacher_name}</span>
              <span className="text-sm opacity-75">
                {room?.last_message?.content}
              </span>
              <span className="text-xs opacity-50">
                {dayjs(room.updated_at).fromNow()} &quot; Unread:{" "}
                {room.unread_count}
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

export const Component = () => {
  const chatRooms = useLoaderData();

  const navigate = useNavigate();

  const [activeRoom, setActiveRoom] = useState(null);

  const handleRoomSelect = (roomId) => {
    setActiveRoom(roomId);
    navigate(`${roomId}`);
  };

  return (
    <div className="flex h-screen">
      {/* Chat Selector */}
      <ChatSelector
        chatRooms={chatRooms}
        onSelectRoom={handleRoomSelect}
        activeRoom={activeRoom}
      />

      {/* Chat Section */}
      <div className="flex flex-col flex-1 bg-base-200">
        {/* Chat Header */}
        <div className="bg-primary text-primary-content p-4">
          <h2 className="text-xl font-bold">
            {chatRooms.find((room) => room.id === activeRoom)?.course_title} -
            Chat
          </h2>
        </div>

        <Outlet />
      </div>
    </div>
  );
};
