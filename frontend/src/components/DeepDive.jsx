import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";

// Hero card shown on EduBoat page. Contains an animation slot you can attach.
export const DeepDiveCard = () => {
  const [animData, setAnimData] = useState(null);
  useEffect(() => {
    fetch("/animations/deepDive.json")
      .then((r) => r.json())
      .then(setAnimData)
      .catch(() => setAnimData(null));
  }, []);
  return (
    <div className="hero-card deepdive-card">
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-eyebrow">Meet the</p>
          <h2 className="hero-title">DeepDive!</h2>
          <p className="hero-sub">Explore topics thoroughly with crystal clarity.</p>
        </div>
        <div className="hero-animation" aria-label="animation-slot" data-slot="deepdive-animation">
          {animData ? (
            <Lottie animationData={animData} loop autoplay style={{ width: "100%", height: "100%" }} />
          ) : null}
        </div>
      </div>
      <div className="hero-cta">
        <span>Get Started</span>
        <span className="cta-arrow">›</span>
      </div>
      <style>{`
        .hero-card { position: relative; width: 340px; height: 600px; border-radius: 28px; padding: 20px; background: linear-gradient(135deg, var(--white), var(--beige)); color: var(--brown); box-shadow: 0 20px 46px rgba(26, 18, 0, 0.15); overflow: hidden; border: 1px solid var(--beige-footer); }
        .hero-card:before { content: ""; position: absolute; inset: 1px; border-radius: 26px; background: linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0)); pointer-events: none; }
        .hero-content { display: grid; grid-template-rows: auto 1fr; height: calc(100% - 84px); gap: 12px; }
        .hero-text { padding: 6px 4px; }
        .hero-eyebrow { margin: 0; font-size: 1.05rem; color: var(--brown); opacity: 0.8; }
        .hero-title { margin: 2px 0 6px 0; font-size: 2.2rem; font-weight: 900; color: var(--accent); }
        .hero-sub { margin: 0; color: var(--brown); opacity: 0.9; font-size: 1rem; }
        .hero-animation { align-self: end; justify-self: center; width: 260px; height: 320px; border-radius: 22px; background: transparent; box-shadow: none; display: flex; align-items: center; justify-content: center; }
        .hero-cta { position: absolute; bottom: 16px; left: 16px; right: 16px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 800; background: var(--accent); color: var(--brown); box-shadow: 0 10px 24px rgba(244, 179, 12, 0.35); }
        .cta-arrow { font-size: 1.6rem; line-height: 1; }
        .deepdive-card .hero-title { color: var(--accent); }
      `}</style>
    </div>
  );
};

const DeepDive = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Welcome to DeepDive! Explore concepts thoroughly 🌊" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatboxRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: input }]);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    // Integrate your DeepDive AI API here:
    // 1) Replace the setTimeout with a fetch/axios call to your deep-dive endpoint.
    // 2) Populate the bot message with the response text.
    // Example:
    // fetch("/api/deepdive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: input }) })
    //   .then(res => res.json())
    //   .then(data => setMessages(prev => [...prev, { type: "bot", text: data.answer }]))
    //   .catch(() => setMessages(prev => [...prev, { type: "bot", text: "Sorry, something went wrong." }])))
    //   .finally(() => setIsTyping(false));

    // Simulated bot response (remove when API is wired)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Here’s a deep-dive explanation for: " + input },
      ]);
      setIsTyping(false);
    }, 800);
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg, #fbf9f1, #fdfcf8)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "1rem",
          textAlign: "center",
          fontSize: "1.7rem",
          fontWeight: "bold",
          background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
          color: "white",
          letterSpacing: "1px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          borderBottomLeftRadius: "12px",
          borderBottomRightRadius: "12px",
        }}
      >
        🔍 DeepDive
      </header>

      {/* Chatbox */}
      <div
        ref={chatboxRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          overflowY: "auto",
          gap: "0.5rem",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: "0.5rem 0",
              padding: "0.8rem 1rem",
              borderRadius: "12px",
              maxWidth: "70%",
              alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
              background:
                msg.type === "user"
                  ? "linear-gradient(135deg, #667eea, #5a67f2)"
                  : "#ddd9c5",
              color: msg.type === "user" ? "white" : "black",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              transform: "translateY(0)",
              opacity: 1,
              animation: index === 0 ? "" : `fadeInUp 0.5s ease forwards`,
              animationDelay: index === 0 ? "" : `${index * 0.1}s`,
              ...(msg.type === "bot" && index > 0 ? { animation: "floatBot 4s ease-in-out infinite" } : {}),
            }}
          >
            {msg.text}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "0.6rem 1rem",
              borderRadius: "12px",
              background: "#ddd9c5",
              color: "black",
              fontStyle: "italic",
              fontSize: "0.9rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              animation: "floatBot 4s ease-in-out infinite",
            }}
          >
            Bot is typing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ccc",
          padding: "0.5rem",
          background: "white",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your question..."
          style={{
            flex: 1,
            padding: "0.7rem",
            border: "1px solid #ccc",
            borderRadius: "12px",
            outline: "none",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
            transition: "box-shadow 0.3s ease",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 5px #667eea")
          }
          onBlur={(e) =>
            (e.target.style.boxShadow =
              "inset 0 2px 4px rgba(0,0,0,0.05)")
          }
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "0.5rem",
            padding: "0.7rem 1.2rem",
            border: "none",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f4b30c, #f4a700)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          Send
        </button>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes floatBot {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}
      </style>
    </div>
  );
};

export default DeepDive;