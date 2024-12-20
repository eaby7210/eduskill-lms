/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from "react";
import apiClient, { wsUrl } from "../../apis/interceptors/axios";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useLoaderData, useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

export async function loader({ params }) {
  const res = await apiClient(`/courses/${params.slug}/messages/`);
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
        className={`chat-bubble ${isOwnMessage ? "chat-bubble-primary" : ""} ${
          message.sender_role === "teacher" ? "chat-bubble-accent" : ""
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export function Component() {
  const user = useSelector((state) => state.user);
  const { results: initialMessages } = useLoaderData();
  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState("");
  const { slug } = useParams();

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `${wsUrl}/ws/course_chat/${slug}/`,
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
      onOpen: () => console.log("Chat WebSocket Connected"),
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
          id: lastJsonMessage.message_id || Date.now(),
          content: lastJsonMessage.message,
          sender: lastJsonMessage.sender_id,
          sender_name: lastJsonMessage.sender_name,
          sender_role: lastJsonMessage.sender_role,
          timestamp: lastJsonMessage.timestamp || new Date().toISOString(),
          is_read: false,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    }
  }, [lastJsonMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendJsonMessage({
      action: "chat_message",
      message: newMessage.trim(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isOwnMessage={message.sender === user.pk}
            len={messages.length}
            index={index}
          />
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input input-bordered flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
