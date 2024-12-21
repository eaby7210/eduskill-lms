/* eslint-disable react/prop-types */
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
  const res = await apiClient(`/user/chats/${params.id}/messages/`);
  return res.data;
}

const Message = ({ message, isOwnMessage, ref }) => (
  <div ref={ref} className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}>
    <div className="chat-header">
      {message.sender_name}
      <time className="text-xs opacity-50 ml-1">
        {dayjs(message.timestamp).fromNow()}
      </time>
    </div>
    <div className={`chat-bubble ${isOwnMessage ? "chat-bubble-primary" : ""}`}>
      {message.content}
    </div>
  </div>
);
export function Component() {
  const user = useSelector((state) => state.user);
  const messagesData = useLoaderData();
  const [messages, setMessages] = useState(messagesData);

  const [newMessage, setNewMessage] = useState("");

  // const formatTimestamp = (timestamp) => {
  //   return dayjs(timestamp).fromNow();
  // };

  const { id } = useParams();

  // const isCommunityChat = id === (messages[0]?.chat + 1).toString();

  const chatEndRef = useRef(null);
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
        interval: 15000, // Send heartbeat every 30 seconds
        timeout: 60000, // Wait 60 seconds for response
      },
      onOpen: () => console.log("WebSocket Connected"),
      onClose: () =>
        console.log("WebSocket Disconnected - Attempting to reconnect..."),
      onError: (error) => console.error("WebSocket Error:", error),
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
      // if (lastJsonMessage?.message !== "pong") {
      if (lastJsonMessage?.type === "chat_message") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: lastJsonMessage.sender_id,
            content: lastJsonMessage.message,
            ...lastJsonMessage,
          },
        ]);
      }
    }
  }, [lastJsonMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendJsonMessage(
      {
        action: "chat_message",
        message: newMessage.trim(),
      },
      true
    );

    setNewMessage("");
  };
  console.log(messages);
  return (
    <>
      {/* Messages Container */}
      <div className="flex flex-col h-5/6">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isOwnMessage={message.sender === user.pk}
              ref={index === messages.length - 1 ? chatEndRef : null}
            />
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4 bg-base-300">
          <div className=" w-full join">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input input-bordered flex-1 join-item"
              placeholder="Type your message here..."
            />
            <button type="submit" className="btn btn-primary join-item">
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
