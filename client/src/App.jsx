import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import ExecutivePanel from "./ExecutivePanel";

// Use environment variable for production, or relative path for same-origin
// In development, empty string uses Vite proxy
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Helper function to construct API URLs
const getApiUrl = (endpoint) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};

export default function App() {
  const { user, loading, isAuthenticated, getAuthHeaders, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi, I'm KTPilot. Upload your docs and ask me anything." },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const topics = [
    "About KTPilot & fraternity",
    "Events & agenda",
    "Membership & eligibility",
    "Project guidelines",
  ];

  const loadDocuments = useCallback(async () => {
    try {
      const res = await axios.get(getApiUrl("/api/documents"), {
        headers: getAuthHeaders(),
      });
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error("Failed to load documents:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [getAuthHeaders, logout]);

  // Load documents on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments();
    }
  }, [isAuthenticated, loadDocuments]);

  const handleAsk = async (e) => {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuery("");
    setIsThinking(true);
    try {
      const res = await axios.post(getApiUrl("/api/ask"), { query: text }, {
        headers: getAuthHeaders(),
      });
      const answer = res.data.answer || "I couldn't generate an answer.";
      const sources = res.data.sources || [];
      
      let answerWithSources = answer;
      if (sources.length > 0) {
        answerWithSources += "\n\n📚 Sources:\n" + sources.map((s, i) => `${i + 1}. ${s.title}`).join("\n");
      }
      
      setMessages((prev) => [...prev, { role: "bot", text: answerWithSources }]);
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
      const res = await axios.post(getApiUrl("/api/upload"), formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus(res.data.message || "Uploaded.");
      await loadDocuments(); // Refresh document list
    } catch (error) {
      setUploadStatus("Upload failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const text = searchQuery.trim();
    if (!text) return;
    
    try {
      const res = await axios.post(getApiUrl("/api/search"), { query: text }, {
        headers: getAuthHeaders(),
      });
      setSearchResults(res.data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    }
  };

  const handleViewDocument = async (id) => {
    try {
      const res = await axios.get(getApiUrl(`/api/documents/${id}`), {
        headers: getAuthHeaders(),
      });
      setSelectedDoc(res.data);
    } catch (error) {
      console.error("Failed to load document:", error);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await axios.delete(getApiUrl(`/api/documents/${id}`), {
        headers: getAuthHeaders(),
      });
      await loadDocuments();
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleQuickTopic = (t) => {
    setQuery(t);
  };

  // Show loading state while checking for existing token
  if (loading) {
    return (
      <div className="ktp-auth-container">
        <div className="ktp-auth-card">
          <div className="ktp-auth-header">
            <div className="ktp-logo-pill">
              <div className="ktp-logo-dot" />
              <span>KTPilot</span>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login/signup/forgot password if not authenticated
  if (!isAuthenticated) {
    if (showForgotPassword) {
      return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
    }
    if (showSignup) {
      return <Signup onSwitchToLogin={() => setShowSignup(false)} />;
    }
    return (
      <Login
        onSwitchToSignup={() => setShowSignup(true)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

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
            <div className="ktp-title">Hello, {user?.name || "User"}</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div className="ktp-status-pill">
              <span className="ktp-status-dot" />
              Online
            </div>
            <button onClick={logout} className="ktp-logout-btn" title="Logout">
              Logout
            </button>
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
            onClick={() => setShowDocuments(!showDocuments)}
          >
            📚 {showDocuments ? "Hide" : "View"} Documents ({documents.length})
          </button>
        </div>

        {uploadStatus && <div className="ktp-upload-status">{uploadStatus}</div>}

        {/* Executive Panel - Only show for executives */}
        {user?.role === "executive" && (
          <ExecutivePanel getAuthHeaders={getAuthHeaders} user={user} />
        )}

        {/* Document Search */}
        <div className="ktp-search-section">
          <form onSubmit={handleSearch} className="ktp-search-form">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ktp-search-input"
            />
            <button type="submit" className="ktp-search-btn">🔍</button>
          </form>
          {searchResults.length > 0 && (
            <div className="ktp-search-results">
              <div className="ktp-search-results-header">
                Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </div>
              {searchResults.map((result) => (
                <div key={result.id} className="ktp-search-result-item">
                  <div className="ktp-search-result-title">{result.title}</div>
                  <div className="ktp-search-result-snippet">{result.snippet}</div>
                  <button
                    className="ktp-view-doc-btn"
                    onClick={() => handleViewDocument(result.id)}
                  >
                    View Document
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document List */}
        {showDocuments && (
          <div className="ktp-documents-list">
            <div className="ktp-documents-header">
              <span>Uploaded Documents ({documents.length})</span>
            </div>
            {documents.length === 0 ? (
              <div className="ktp-empty-state">No documents uploaded yet.</div>
            ) : (
              <div className="ktp-documents-items">
                {documents.map((doc) => (
                  <div key={doc.id} className="ktp-document-item">
                    <div className="ktp-document-info">
                      <div className="ktp-document-title">{doc.title}</div>
                      <div className="ktp-document-meta">
                        {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.contentLength} chars
                      </div>
                    </div>
                    <div className="ktp-document-actions">
                      <button
                        className="ktp-doc-action-btn"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        View
                      </button>
                      <button
                        className="ktp-doc-action-btn ktp-delete-btn"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Document View */}
        {selectedDoc && (
          <div className="ktp-document-viewer">
            <div className="ktp-document-viewer-header">
              <h3>{selectedDoc.title}</h3>
              <button
                className="ktp-close-btn"
                onClick={() => setSelectedDoc(null)}
              >
                ✕
              </button>
            </div>
            <div className="ktp-document-content">
              {selectedDoc.content}
            </div>
          </div>
        )}

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
