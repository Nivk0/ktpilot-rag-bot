import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5050";

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi, I’m KTPilot. Upload your docs and ask me anything." },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const topics = [
    "About KTPilot & fraternity",
    "Events & agenda",
    "Membership & eligibility",
    "Project guidelines",
  ];

  const handleAsk = async (e) => {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuery("");
    setIsThinking(true);
    try {
      const res = await axios.post(`${API_BASE}/api/ask`, { query: text });
      const answer = res.data.answer || "I couldn't generate an answer.";
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error. Is backend running?" },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(res.data.message || "Uploaded.");
    } catch {
      setUploadStatus("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleQuickTopic = (t) => {
    setQuery(t);
  };

  return (
    <div className="ktp-root">
      <aside className="ktp-left">
        <div className="ktp-logo-pill">
          <div className="ktp-logo-dot" />
          <span>KTPilot</span>
        </div>
        <div className="ktp-bot-card">
          <div className="ktp-bot-avatar">
            <div className="ktp-bot-face" />
          </div>
          <h1>Meet KTPilot!</h1>
          <p>Your AI assistant for KTP, events, docs, and FAQs.</p>
          <button
            className="ktp-primary-btn"
            onClick={() =>
              document
                .getElementById("ktp-chat-input")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Let&apos;s Chat Now
          </button>
        </div>
        <div className="ktp-left-footer">
          <p>Upload docs on the right, ask anything here.</p>
        </div>
      </aside>

      <section className="ktp-center">
        <header className="ktp-header">
          <div>
            <div className="ktp-subtitle">Welcome back</div>
            <div className="ktp-title">Hello, Robert</div>
          </div>
          <div className="ktp-status-pill">
            <span className="ktp-status-dot" />
            Online
          </div>
        </header>

        <div className="ktp-actions-grid">
          <button className="ktp-action-card" onClick={() => handleQuickTopic("Talk with KTPilot")}>
            💬 Talk with KTPilot
          </button>
          <button
            className="ktp-action-card"
            onClick={() => handleQuickTopic("Summarize my latest uploaded document.")}
          >
            📄 Ask from Docs
          </button>
          <label className="ktp-action-card ktp-upload-card">
            ⬆️ Upload document
            <input type="file" onChange={handleFileChange} disabled={uploading} />
          </label>
          <button
            className="ktp-action-card"
            onClick={() => handleQuickTopic("Show me a quick timeline of KTP.")}
          >
            🕒 KTP Timeline
          </button>
        </div>

        {uploadStatus && <div className="ktp-upload-status">{uploadStatus}</div>}

        <div className="ktp-topics">
          <div className="ktp-topics-header">
            <span>Topics</span>
          </div>
          <div className="ktp-topics-list">
            {topics.map((t) => (
              <button key={t} className="ktp-topic-pill" onClick={() => handleQuickTopic(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ktp-right">
        <header className="ktp-chat-header">
          <div className="ktp-chat-avatar" />
          <div>
            <div className="ktp-chat-title">KTPilot</div>
            <div className="ktp-chat-subtitle">Ask anything</div>
          </div>
        </header>

        <div className="ktp-chat-history">
          {messages.map((m, i) => (
            <div
              key={i}
              className={"ktp-msg " + (m.role === "user" ? "ktp-msg-user" : "ktp-msg-bot")}
            >
              {m.text}
            </div>
          ))}
          {isThinking && (
            <div className="ktp-msg ktp-msg-bot ktp-typing">KTPilot is thinking...</div>
          )}
        </div>

        <form className="ktp-chat-input-row" onSubmit={handleAsk}>
          <input
            id="ktp-chat-input"
            type="text"
            placeholder="Hello KTPilot, how are you today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </div>
  );
}
