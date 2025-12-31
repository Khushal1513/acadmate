import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase"; // ✅ client auth ONLY

const SeniorsPage = ({ onBackToHome }) => {
  const bannedWords = ["none", "nothing"];

  const containsBadWord = (text) =>
    bannedWords.some((word) => text.toLowerCase().includes(word));

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [canSend, setCanSend] = useState(true);
  const messagesEndRef = useRef(null);

  // ⏱️ Cooldown
  useEffect(() => {
    if (!canSend) {
      const timer = setTimeout(() => setCanSend(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canSend]);

  // 🔄 Fetch messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/seniors");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // polling
    return () => clearInterval(interval);
  }, []);

  // 🚀 Send message via backend
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;
    if (!canSend) return alert("⏳ Please wait before sending again.");
    if (containsBadWord(message))
      return alert("⚠️ Please avoid inappropriate language.");

    try {
      await fetch("http://localhost:5000/api/seniors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          email: auth.currentUser?.email,
        }),
      });

      setMessage("");
      setCanSend(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="broadcast-page">
      <header className="broadcast-header">
        📡 Community Broadcast Room
      </header>

      <div className="broadcast-container">
        <div className="broadcast-chat">
          <div className="broadcast-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`broadcast-message ${
                  msg.email === auth.currentUser?.email
                    ? "user-msg"
                    : "other-msg"
                }`}
              >
                <strong>{msg.email?.split("@")[0] || "Guest"}:</strong>{" "}
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="broadcast-input-area">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SeniorsPage;
