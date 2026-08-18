import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetUserId } = useParams();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Convert timestamp into "just now", "2 min ago", etc.
  const getTimeAgo = (date) => {
    if (!date) return "";

    const messageTime = new Date(date);
    const currentTime = new Date();

    const differenceInSeconds = Math.floor(
      (currentTime - messageTime) / 1000
    );

    if (differenceInSeconds < 60) {
      return "just now";
    }

    const differenceInMinutes = Math.floor(differenceInSeconds / 60);

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    }

    const differenceInHours = Math.floor(differenceInMinutes / 60);

    if (differenceInHours < 24) {
      return `${differenceInHours} ${
        differenceInHours === 1 ? "hour" : "hours"
      } ago`;
    }

    const differenceInDays = Math.floor(differenceInHours / 24);

    if (differenceInDays === 1) {
      return "yesterday";
    }

    return `${differenceInDays} days ago`;
  };

  const fetchChatMessages = async () => {
    try {
      const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
        withCredentials: true,
      });

      const chatMessages = chat?.data?.messages.map((msg) => {
        const { senderId, text, createdAt } = msg;

        return {
          senderId: senderId?._id,
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          text,
          createdAt,
        };
      });

      setMessages(chatMessages || []);
    } catch (error) {
      console.log("Error fetching chat:", error);
    }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [targetUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Socket connection
  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();

    socketRef.current = socket;

    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    // Target user is online
    socket.on("userOnline", () => {
      setIsOnline(true);
    });

    // Target user is offline
    socket.on("userOffline", ({ userId: offlineUserId }) => {
      if (offlineUserId === targetUserId) {
        setIsOnline(false);
      }
    });

    // Receive message
    socket.on(
      "messageReceived",
      ({ senderId, firstName, lastName, text, createdAt }) => {
        setMessages((messages) => [
          ...messages,
          {
            senderId,
            firstName,
            lastName,
            text,
            createdAt,
          },
        ]);
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, targetUserId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const socket = socketRef.current;

    if (!socket) return;

    socket.emit("sendMessage", {
      firstName: user.firstName,
      lastName: user.lastName,
      userId,
      targetUserId,
      text: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="w-3/4 max-w-4xl mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-600">
        <h1 className="text-lg font-semibold">Chat</h1>

        <div className="flex items-center gap-2 mt-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>

          <span className="text-sm opacity-70">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 scroll-smooth">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "chat " +
                (user._id === msg.senderId
                  ? "chat-end"
                  : "chat-start")
              }
            >
              <div className="chat-header">
                {`${msg.firstName} ${msg.lastName}`}

                <time className="text-xs opacity-50 ml-2">
                  {getTimeAgo(msg.createdAt)}
                </time>
              </div>

              <div className="chat-bubble">{msg.text}</div>

              <div className="chat-footer opacity-50">
                Seen
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="p-5 border-t border-gray-600 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 border border-gray-500 text-white rounded p-2"
        />

        <button
          onClick={sendMessage}
          className="btn btn-secondary"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;