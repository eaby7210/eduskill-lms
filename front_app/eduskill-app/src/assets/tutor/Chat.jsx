/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import apiClient from "../../apis/interceptors/axios";
// Initialize dayjs relative time plugin
dayjs.extend(relativeTime);

export async function loader({ params }) {
  const res = await apiClient(`/tutor/chats/?course_slug=${params.slug}/`);
  return res.data;
}

const ChatSelector = ({ chatRooms, onSelectRoom, activeRoom }) => {
  return (
    <ul className="menu p-4 space-y-2">
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
                  <span className="text-xl">{room.student_name?.[0]}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold">{room.student_name}</span>
                <span className="text-sm opacity-75 truncate">
                  {room?.last_message?.content || "No messages yet"}
                </span>
                <span className="text-xs opacity-50">
                  {dayjs(room.updated_at).fromNow()}
                  {room.unread_count > 0 && (
                    <span className="badge badge-primary ml-2">
                      {room.unread_count}
                    </span>
                  )}
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
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeRoom, setActiveRoom] = useState(null);

  const handleRoomSelect = async (roomId) => {
    setActiveRoom(roomId);
    // Mark messages as read when selecting a room
    try {
      await apiClient.post(`/tutor/chats/${roomId}/mark_read/`);
      navigate(`${roomId}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
      navigate(`${roomId}`);
    }
  };

  // Sort chat rooms by unread messages and last message timestamp
  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    if (a.unread_count !== b.unread_count) {
      return b.unread_count - a.unread_count;
    }
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  return (
    <div className="drawer lg:drawer-open h-[calc(100vh-4rem)]">
      <input id="chat-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-base-100">
        <div className="sticky top-0  flex items-center gap-2 bg-base-100 bg-opacity-90 px-4 py-2 backdrop-blur lg:hidden">
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
          <div className="flex-1 font-bold">Student Chats</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Outlet context={{ courseSlug: slug }} />
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
            Student Messages
          </div>
          <ChatSelector
            chatRooms={sortedChatRooms}
            onSelectRoom={handleRoomSelect}
            activeRoom={activeRoom}
          />
        </div>
      </div>
    </div>
  );
};
