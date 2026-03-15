import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Square, X, Film, Mic2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* ─── Injected styles ─────────────────────────────────────── */
const CHAT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  :root {
    --c-red:        #e50914;
    --c-red-dim:    rgba(229, 9, 20, 0.15);
    --c-red-glow:   rgba(229, 9, 20, 0.40);
    --c-bg:         #0a0a0a;
    --c-surface:    #111111;
    --c-surface2:   #181818;
    --c-surface3:   #202020;
    --c-border:     rgba(255,255,255,0.07);
    --c-border-red: rgba(229,9,20,0.35);
    --c-text:       #f0f0f0;
    --c-muted:      #555;
    --c-muted2:     #888;
    --radius-lg:    18px;
    --radius-md:    12px;
    --radius-sm:    8px;
  }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .chat-cursor::after {
    content: '▋';
    color: var(--c-red);
    animation: blink 1s step-end infinite;
    margin-left: 2px;
    font-size: .9em;
  }

  @keyframes bounce-dot {
    0%,80%,100% { transform: translateY(0); opacity:.4; }
    40%         { transform: translateY(-6px); opacity:1; }
  }
  .dot-1 { animation: bounce-dot 1.2s ease-in-out infinite; }
  .dot-2 { animation: bounce-dot 1.2s ease-in-out .2s infinite; }
  .dot-3 { animation: bounce-dot 1.2s ease-in-out .4s infinite; }

  @keyframes fab-pulse {
    0%,100% { box-shadow: 0 0 0 0 var(--c-red-glow), 0 8px 32px rgba(0,0,0,.6); }
    50%      { box-shadow: 0 0 0 10px transparent,    0 8px 32px rgba(0,0,0,.6); }
  }
  .fab-glow { animation: fab-pulse 2.8s ease-in-out infinite; }

  .chat-scroll { scrollbar-width: thin; scrollbar-color: var(--c-red) transparent; }
  .chat-scroll::-webkit-scrollbar { width: 4px; }
  .chat-scroll::-webkit-scrollbar-thumb { background: var(--c-red); border-radius: 4px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }

  .msg-markdown p   { margin: 0 0 .4em; line-height: 1.6; }
  .msg-markdown p:last-child { margin-bottom: 0; }
  .msg-markdown ul, .msg-markdown ol { padding-left: 1.2em; margin: .3em 0; }
  .msg-markdown li  { margin-bottom: .25em; }
  .msg-markdown strong { color: #fff; font-weight: 600; }
  .msg-markdown code {
    background: rgba(255,255,255,.1);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: .82em;
    font-family: 'Courier New', monospace;
  }

  .chat-input:focus {
    outline: none;
    border-color: var(--c-red) !important;
    box-shadow: 0 0 0 3px var(--c-red-dim), inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .send-btn { position: relative; overflow: hidden; }
  .send-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: rgba(255,255,255,.15);
    border-radius: inherit;
    opacity: 0;
    transition: opacity .2s;
  }
  .send-btn:active::after { opacity: 1; }

  .chat-grain::before {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    opacity: .5;
  }

  .chat-bubble { transition: filter .2s; }
  .chat-bubble:hover { filter: brightness(1.06); }

  /* ─── Responsive ─── */
  .chat-panel {
    position: fixed;
    bottom: 100px;
    right: 28px;
    width: 420px;
    height: 640px;
    z-index: 9998;
    border-radius: 20px;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
    box-shadow: 0 32px 80px rgba(0,0,0,.85), 0 0 0 1px var(--c-border-red), inset 0 1px 0 rgba(255,255,255,.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* Tablet */
  @media (max-width: 480px) {
    .chat-panel {
      bottom: 0;
      right: 0;
      left: 0;
      width: 100%;
      height: 85dvh;
      border-radius: 20px 20px 0 0;
      border-bottom: none;
    }
    .chat-fab {
      bottom: 16px !important;
      right: 16px !important;
    }
  }

  /* Very small screens */
  @media (max-width: 360px) {
    .chat-panel {
      height: 90dvh;
    }
  }

  /* Medium screens — slight shrink */
  @media (min-width: 481px) and (max-width: 640px) {
    .chat-panel {
      width: calc(100vw - 40px);
      right: 20px;
      bottom: 90px;
    }
  }
`;

/* ─── Typing indicator ─── */
const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, padding: "4px 2px", alignItems: "center" }}>
    <span className="dot-1" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-red)", display: "inline-block" }} />
    <span className="dot-2" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-red)", display: "inline-block" }} />
    <span className="dot-3" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-red)", display: "inline-block" }} />
  </div>
);

/* ─── Avatar ─── */
const BotAvatar = () => (
  <div style={{
    width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 2,
    background: "linear-gradient(135deg, #1a0000 0%, #3a0000 100%)",
    border: "1.5px solid var(--c-red)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <Film size={13} color="var(--c-red)" />
  </div>
);

/* ═══════════════════════════════════════════════════════
   CHATBOT COMPONENT
═══════════════════════════════════════════════════════ */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me about movies 🎬" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const isStreaming = useRef(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (document.getElementById("chatbot-styles")) return;
    const tag = document.createElement("style");
    tag.id = "chatbot-styles";
    tag.textContent = CHAT_STYLES;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  /* ── Send message ── */
  const handleSend = async () => {
    if (!input.trim() || isStreaming.current) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setMessages((prev) => [...prev, { sender: "bot", text: "", isTyping: true }]);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch("http://127.0.0.1:8000/api/chat_rag/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessage = "";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: "", isStreaming: true };
        return updated;
      });
      isStreaming.current = true;
      setStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true }).split("\n");
        for (let line of chunk) {
          if (!line) continue;
          try {
            const data = JSON.parse(line);
            if (data.delta) botMessage += data.delta;
          } catch (err) {
            console.error("Chunk parse error:", err);
          }
        }
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "bot", text: botMessage || "", isStreaming: true };
          return updated;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: botMessage };
        return updated;
      });

      isStreaming.current = false;
      setStreaming(false);
      abortControllerRef.current = null;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error:", error);
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.isTyping)
            updated[updated.length - 1] = { sender: "bot", text: "⚠️ Error connecting to AI." };
          else updated.push({ sender: "bot", text: "⚠️ Error connecting to AI." });
          return updated;
        });
      }
      isStreaming.current = false;
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  /* ── Stop streaming ── */
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      isStreaming.current = false;
      setStreaming(false);
      abortControllerRef.current = null;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.sender === "bot" && (last.isTyping || last.text === "")) updated.pop();
        else if (last?.isStreaming) updated[updated.length - 1] = { sender: "bot", text: last.text };
        return updated;
      });
    }
  };

  /* ── Render ── */
  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fab-glow chat-fab"
        style={{
          position: "fixed", bottom: 28, right: 28,
          width: 58, height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #c40812 0%, #e50914 60%, #ff2020 100%)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
          color: "#fff",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .2 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: .2 }}>
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="chat-grain chat-panel"
          >
            {/* ── Header ── */}
            <div style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #140000 0%, #200000 100%)",
              borderBottom: "1px solid var(--c-border-red)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "relative", zIndex: 1,
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "var(--c-red)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px var(--c-red-glow)",
                  flexShrink: 0,
                }}>
                  <Mic2 size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: ".1em", color: "#fff", lineHeight: 1 }}>
                    FLICK <span style={{ color: "var(--c-red)" }}>BUDDY</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: streaming ? "#ffc107" : "#22c55e",
                      display: "inline-block",
                      boxShadow: streaming ? "0 0 6px #ffc107" : "0 0 6px #22c55e",
                    }} />
                    <span style={{ fontSize: ".68rem", color: "var(--c-muted2)", letterSpacing: ".05em", textTransform: "uppercase" }}>
                      {streaming ? "Thinking…" : "Online"}
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: .9 }}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid var(--c-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--c-muted2)",
                  transition: "color .2s",
                  flexShrink: 0,
                }}
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* ── Messages ── */}
            <div
              className="chat-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "var(--c-bg)",
                minHeight: 0,
              }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: .97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: .25, ease: [.22,.68,0,1.2] }}
                  style={{
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  {msg.sender === "bot" && <BotAvatar />}

                  <div
                    className="chat-bubble"
                    style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: msg.sender === "user"
                        ? "16px 4px 16px 16px"
                        : "4px 16px 16px 16px",
                      background: msg.sender === "user"
                        ? "linear-gradient(135deg, #c40812 0%, #e50914 100%)"
                        : "var(--c-surface2)",
                      border: msg.sender === "user"
                        ? "none"
                        : "1px solid var(--c-border)",
                      boxShadow: msg.sender === "user"
                        ? "0 6px 20px var(--c-red-dim)"
                        : "0 2px 12px rgba(0,0,0,.4)",
                      fontSize: ".875rem",
                      lineHeight: 1.6,
                      color: msg.sender === "user" ? "#fff" : "var(--c-text)",
                      position: "relative",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.isTyping ? (
                      <TypingDots />
                    ) : (
                      <div className={`msg-markdown${msg.isStreaming ? " chat-cursor" : ""}`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div style={{
              padding: "12px 14px",
              background: "var(--c-surface)",
              borderTop: "1px solid var(--c-border)",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about any movie…"
                disabled={streaming}
                style={{
                  flex: 1,
                  background: "var(--c-surface2)",
                  border: "1px solid var(--c-border)",
                  borderRadius: 12,
                  padding: "11px 16px",
                  color: "var(--c-text)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".875rem",
                  transition: "border-color .25s, box-shadow .25s",
                  opacity: streaming ? .5 : 1,
                  minWidth: 0,
                }}
              />

              <AnimatePresence mode="wait">
                {streaming ? (
                  <motion.button
                    key="stop"
                    onClick={handleStop}
                    initial={{ scale: .8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: .8, opacity: 0 }}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: .93 }}
                    style={{
                      flexShrink: 0,
                      width: 42, height: 42,
                      borderRadius: 12,
                      background: "var(--c-surface3)",
                      border: "1px solid var(--c-border)",
                      color: "#ffc107",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 0 12px rgba(255,193,7,.15)",
                    }}
                  >
                    <Square size={16} fill="#ffc107" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="send"
                    onClick={handleSend}
                    className="send-btn"
                    initial={{ scale: .8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: .8, opacity: 0 }}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: .93 }}
                    disabled={!input.trim()}
                    style={{
                      flexShrink: 0,
                      width: 42, height: 42,
                      borderRadius: 12,
                      background: input.trim()
                        ? "linear-gradient(135deg, #c40812 0%, #e50914 100%)"
                        : "var(--c-surface3)",
                      border: input.trim() ? "none" : "1px solid var(--c-border)",
                      color: input.trim() ? "#fff" : "var(--c-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: input.trim() ? "pointer" : "default",
                      boxShadow: input.trim() ? "0 4px 16px var(--c-red-dim)" : "none",
                      transition: "all .25s ease",
                    }}
                  >
                    <Send size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Footer hint */}
            <div style={{
              textAlign: "center",
              padding: "6px 0 10px",
              background: "var(--c-surface)",
              borderTop: "1px solid var(--c-border)",
              fontSize: ".65rem",
              color: "var(--c-muted)",
              letterSpacing: ".05em",
              flexShrink: 0,
            }}>
              Press <kbd style={{ background: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: 4, padding: "1px 5px", fontSize: ".65rem", color: "var(--c-muted2)" }}>Enter</kbd> to send
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;