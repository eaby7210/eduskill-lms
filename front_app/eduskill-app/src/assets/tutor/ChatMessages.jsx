/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import apiClient, { wsUrl } from "../../apis/interceptors/axios";
import useWebSocket from "react-use-websocket";
import { useLoaderData, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
// Initialize dayjs relative time plugin
dayjs.extend(relativeTime);

export async function loader({ params }) {
  const res = await apiClient(`/tutor/chats/${params.id}/messages/`);
  return res.data;
}

const Message = ({ message, isOwnMessage, len, index }) => {
  const chatBoxRef = useRef(null);
  useEffect(() => {
    if (index === len - 1) {
      chatBoxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, []);
  return (
    <div
      ref={chatBoxRef}
      className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
    >
      <div className="chat-header">
        {message.sender_name}
        <time className="text-xs opacity-50 ml-1">
          {dayjs(message.timestamp).fromNow()}
        </time>
      </div>
      <div
        className={`chat-bubble ${isOwnMessage ? "chat-bubble-primary" : ""}`}
      >
        {message.content}
      </div>
    </div>
  );
};

export function Component() {
  const user = useSelector((state) => state.user);
  const initialMessages = useLoaderData();
  const [messages, setMessages] = useState(initialMessages);

  const [newMessage, setNewMessage] = useState("");

  const { id } = useParams();

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `${wsUrl}/ws/chat/${id}/`,
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
        interval: 15000,
        timeout: 60000,
      },
      onOpen: () => console.log("WebSocket Connected"),
      onClose: () =>
        console.log("WebSocket Disconnected - Attempting to reconnect..."),
      onError: (error) => console.error("WebSocket Error:", error),
    }
  );

  useEffect(() => {
    if (lastJsonMessage) {
      console.log(lastJsonMessage);
      if (lastJsonMessage?.type === "chat_message") {
        const newMsg = {
          id: Date.now(),
          content: lastJsonMessage.message,
          sender: lastJsonMessage.sender_id,
          sender_name: lastJsonMessage.sender_name,
          timestamp: new Date().toISOString(),
          chat: parseInt(id),
        };
        setMessages((prev) => [...prev, newMsg]);

        // Mark message as read if it's from the student
        if (lastJsonMessage.sender_id !== user.pk) {
          apiClient.post(`/tutor/chats/${id}/mark_read/`).catch((error) => {
            console.error("Error marking message as read:", error);
          });
        }
      }
    }
  }, [lastJsonMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    console.log(newMessage);
    // Send to WebSocket
    sendJsonMessage({
      action: "chat_message",
      message: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isOwnMessage={message.sender === user.pk}
            len={message.length}
            index={index}
            // ref={index === messages.length - 1 ? chatEndRef : null}
          />
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="border-t bg-base-200 p-4">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Message your student"
            className="input input-bordered join-item flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary join-item">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
