import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const getApiUrl = (endpoint) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};

export default function Messaging({ getAuthHeaders, user, onBack }) {
  const [view, setView] = useState("conversations"); // "conversations", "addContact", "chat"
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      const res = await axios.get(getApiUrl("/api/conversations"), {
        headers: getAuthHeaders(),
      });
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, [getAuthHeaders]);

  const loadAllUsers = useCallback(async () => {
    try {
      const res = await axios.get(getApiUrl("/api/users"), {
        headers: getAuthHeaders(),
      });
      setAllUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, [getAuthHeaders]);

  const loadChatMessages = useCallback(async (userId) => {
    try {
      const res = await axios.get(getApiUrl(`/api/messages/${userId}`), {
        headers: getAuthHeaders(),
      });
      setChatMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (view === "conversations") {
      loadConversations();
    } else if (view === "addContact") {
      loadAllUsers();
    }
  }, [view, loadConversations, loadAllUsers]);

  useEffect(() => {
    if (selectedUser) {
      loadChatMessages(selectedUser.id);
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => {
        loadChatMessages(selectedUser.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, loadChatMessages]);

  const handleAddContact = async (userId) => {
    try {
      await axios.post(
        getApiUrl("/api/contacts"),
        { userId },
        { headers: getAuthHeaders() }
      );
      loadAllUsers();
      loadConversations();
      setView("conversations");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add contact");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !selectedUser) return;

    setLoading(true);
    try {
      await axios.post(
        getApiUrl("/api/messages"),
        { recipientId: selectedUser.id, text },
        { headers: getAuthHeaders() }
      );
      setMessageText("");
      loadChatMessages(selectedUser.id);
      loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (conversation) => {
    setSelectedUser({
      id: conversation.userId,
      name: conversation.name,
      email: conversation.email,
    });
    setView("chat");
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === "chat" && selectedUser) {
    return (
      <div className="ktp-messaging-container">
        <div className="ktp-messaging-header">
          <button onClick={() => setView("conversations")} className="ktp-back-btn">
            ← Back
          </button>
          <div>
            <div className="ktp-messaging-title">{selectedUser.name}</div>
            <div className="ktp-messaging-subtitle">{selectedUser.email}</div>
          </div>
        </div>

        <div className="ktp-messaging-chat">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`ktp-msg-wrapper ${
                msg.isFromMe ? "ktp-msg-wrapper-user" : "ktp-msg-wrapper-bot"
              }`}
            >
              {!msg.isFromMe && (
                <div className="ktp-msg-avatar">
                  <div className="ktp-bot-face-small" />
                </div>
              )}
              <div
                className={`ktp-msg ${msg.isFromMe ? "ktp-msg-user" : "ktp-msg-bot"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form className="ktp-messaging-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !messageText.trim()}>
            Send
          </button>
        </form>
      </div>
    );
  }

  if (view === "addContact") {
    return (
      <div className="ktp-messaging-container">
        <div className="ktp-messaging-header">
          <button onClick={() => setView("conversations")} className="ktp-back-btn">
            ← Back
          </button>
          <div className="ktp-messaging-title">Add Contact</div>
        </div>

        <div className="ktp-messaging-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="ktp-messaging-list">
          {filteredUsers.length === 0 ? (
            <div className="ktp-empty-state">No users found</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="ktp-messaging-item">
                <div>
                  <div className="ktp-messaging-item-name">{u.name}</div>
                  <div className="ktp-messaging-item-email">{u.email}</div>
                </div>
                <button
                  onClick={() => handleAddContact(u.id)}
                  className="ktp-add-contact-btn"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ktp-messaging-container">
      <div className="ktp-messaging-header">
        <button onClick={onBack} className="ktp-back-btn">
          ← Back
        </button>
        <div className="ktp-messaging-title">Messages</div>
        <button
          onClick={() => setView("addContact")}
          className="ktp-add-contact-header-btn"
        >
          + Add
        </button>
      </div>

      <div className="ktp-messaging-list">
        {conversations.length === 0 ? (
          <div className="ktp-empty-state">
            No conversations yet. Add a contact to start messaging!
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.userId}
              className="ktp-messaging-item ktp-conversation-item"
              onClick={() => handleStartChat(conv)}
            >
              <div className="ktp-msg-avatar">
                <div className="ktp-bot-face-small" />
              </div>
              <div className="ktp-messaging-item-content">
                <div className="ktp-messaging-item-header">
                  <div className="ktp-messaging-item-name">{conv.name}</div>
                  {conv.unreadCount > 0 && (
                    <span className="ktp-unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                {conv.lastMessage && (
                  <div className="ktp-messaging-item-preview">
                    {conv.lastMessage.isFromMe ? "You: " : ""}
                    {conv.lastMessage.text}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

