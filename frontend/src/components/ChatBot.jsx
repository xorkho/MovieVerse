import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Square,
  Send,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me about movies 🎬" },
  ]);
  const [input, setInput] = useState("");
  const isStreaming = useRef(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming.current) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      abortControllerRef.current = new AbortController(); // new AbortController
      const response = await fetch("http://127.0.0.1:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
        signal: abortControllerRef.current.signal, // attach signal
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessage = "";

      setMessages((prev) => [...prev, { sender: "bot", text: "typing..." }]);
      isStreaming.current = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder
          .decode(value, { stream: true })
          .trim()
          .split("\n");
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
          updated[updated.length - 1] = {
            sender: "bot",
            text: botMessage || "⌛ typing...",
          };
          return updated;
        });
      }

      isStreaming.current = false;
      abortControllerRef.current = null;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚠️ Error connecting to AI." },
        ]);
      }
      isStreaming.current = false;
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // stop streaming
      isStreaming.current = false;
      abortControllerRef.current = null;


      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.text === "typing...") {
       
          updated.pop();
        }
        return updated;
      });
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:shadow-red-600/25 transition-all duration-300 z-50"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </motion.div>

        {/* Notification pulse effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for fullscreen */}
            {isFull && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={`fixed ${
                isFull
                  ? "inset-4 w-auto h-auto m-0 z-50"
                  : "bottom-24 right-6 w-[420px] h-[700px] z-40"
              } bg-gray-800 text-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-700`}
            >
              {/* Header */}
              <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Flick Buddy</h3>
                    <p className="text-xs text-white/80">AI Movie Assistant</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setIsFull(!isFull)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isFull ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </motion.button>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-900">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] px-5 py-4 rounded-2xl shadow-lg ${
                        msg.sender === "user"
                          ? "bg-red-600 text-white rounded-br-md"
                          : "bg-gray-700 text-gray-100 rounded-bl-md border border-gray-600"
                      }`}
                    >
                      {msg.sender === "bot" && msg.text === "typing..." ? (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                          <span className="text-gray-300">
                            AI is thinking...
                          </span>
                        </div>
                      ) : (
                        <div className="prose prose-base max-w-none leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong
                                  className={
                                    msg.sender === "user"
                                      ? "text-white"
                                      : "text-gray-100"
                                  }
                                >
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-3 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-3 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-relaxed">{children}</li>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-2">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold mb-2">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-medium mb-1">
                                  {children}
                                </h3>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-gray-500 pl-3 italic opacity-80 mb-3">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children }) => (
                                <code
                                  className={`px-2 py-1 rounded text-xs ${
                                    msg.sender === "user"
                                      ? "bg-red-700"
                                      : "bg-gray-600"
                                  }`}
                                >
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre
                                  className={`p-3 rounded-lg overflow-x-auto text-xs mb-3 ${
                                    msg.sender === "user"
                                      ? "bg-red-700"
                                      : "bg-gray-600"
                                  }`}
                                >
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Input */}
              <div className="p-5 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask me about any movie..."
                      disabled={isStreaming.current}
                      className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all duration-200 disabled:opacity-50 resize-none min-h-[48px] max-h-32"
                    />
                  </div>

                  {isStreaming.current ? (
                    <motion.button
                      onClick={handleStop}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center"
                    >
                      <Square size={16} />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleSend}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!input.trim()}
                      className="bg-red-600 text-white p-4 rounded-xl hover:shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[48px]"
                    >
                      <Send size={18} />
                    </motion.button>
                  )}
                </div>

                {/* Quick suggestions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    "Popular movies",
                    "Movie recommendations",
                    "Latest releases",
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-full transition-colors border border-gray-600"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
