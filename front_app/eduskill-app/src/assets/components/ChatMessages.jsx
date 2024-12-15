/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import apiClient, { wsUrl } from "../../apis/interceptors/axios";
import useWebSocket from "react-use-websocket";
import { useLoaderData, useParams, useRevalidator } from "react-router-dom";
import { useSelector } from "react-redux";
// Initialize dayjs relative time plugin
dayjs.extend(relativeTime);

export async function loader({ params }) {
  const res = await apiClient(`/user/chats/${params.id}/messages/`);
  console.log(res.data);
  return res.data;
}
export function Component() {
  const user = useSelector((state) => state.user);
  const messages = useLoaderData();

  const [newMessage, setNewMessage] = useState("");
  const revalidator = useRevalidator();

  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).fromNow();
  };

  const chatEndRef = useRef(null);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `${wsUrl}/ws/chat/${useParams().id}/`,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      queryParams: {
        token: localStorage.getItem("access_token") || null,
      },
      heartbeat: {
        message: JSON.stringify({ action: "ping" }),
        returnMessage: JSON.stringify({ message: "pong" }),
        interval: 15000, // Send heartbeat every 30 seconds
        timeout: 60000, // Wait 60 seconds for response
      },
      onOpen: () => {
        console.log("WebSocket Connected");
      },
      onClose: () => {
        console.log("WebSocket Disconnected - Attempting to reconnect...");
      },
      onError: (error) => {
        console.error("WebSocket Error:", error);
      },
    }
  );

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Assuming `messages` is your message array

  useEffect(() => {
    if (lastJsonMessage) {
      console.log(lastJsonMessage);
    }
    if (lastJsonMessage?.message !== "pong") {
      revalidator.revalidate();
      scrollToBottom();
    }
  }, [lastJsonMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      action: "chat_message",
      message: newMessage.trim(),
    };
    sendJsonMessage(newMsg, true);
    setNewMessage("");
    revalidator.revalidate();
  };

  return (
    <>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message?.sender === user.pk ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-header">
              {message?.sender_name}
              <time className="text-xs opacity-50 ml-2">
                {formatTimestamp(message.timestamp)}
              </time>
            </div>
            <div className="chat-bubble">{message.content}</div>
            <div className="chat-footer opacity-50">
              {message.is_read ? "Seen" : "Delivered"}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-base-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input input-bordered flex-1"
            placeholder="Type your message here..."
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </>
  );
}
