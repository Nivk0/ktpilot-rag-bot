import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const getApiUrl = (endpoint) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};

export default function ExecutivePanel({ getAuthHeaders, user }) {
  const [email, setEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError("");
    try {
      const res = await axios.get(getApiUrl("/api/auth/executive/users"), {
        headers: getAuthHeaders(),
      });
      setUsers(res.data.users || []);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setError("");
    setGeneratedCode(null);
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const res = await axios.post(
        getApiUrl("/api/auth/executive/generate-reset-code"),
        { email: normalizedEmail },
        { headers: getAuthHeaders() }
      );
      setGeneratedCode({
        code: res.data.code,
        email: res.data.email,
        userName: res.data.userName,
        expiresAt: res.data.expiresAt,
        expiresIn: res.data.expiresIn,
      });
      setEmail(""); // Clear email after successful generation
    } catch (error) {
      setError(error.response?.data?.error || "Failed to generate reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userEmail) => {
    setEmail(userEmail);
    setGeneratedCode(null);
    setError("");
  };

  useEffect(() => {
    if (showUsers) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUsers]);

  return (
    <div style={{ 
      background: "rgba(0, 0, 0, 0.96)", 
      borderRadius: "16px", 
      padding: "24px", 
      marginTop: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
      border: "1px solid rgba(255, 255, 255, 0.15)"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ margin: 0, color: "#ffffff" }}>🔑 Executive Panel - Generate Reset Code</h2>
        <button
          onClick={() => setShowUsers(!showUsers)}
          style={{
            padding: "8px 16px",
            background: showUsers ? "#ffffff" : "#333333",
            color: showUsers ? "#000000" : "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {showUsers ? "Hide" : "Show"} Users ({users.length})
        </button>
      </div>

      {showUsers && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px", 
          background: "rgba(0, 0, 0, 0.5)", 
          borderRadius: "12px",
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          {loadingUsers ? (
            <p style={{ color: "#ffffff" }}>Loading users...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "#ffffff" }}>No users found.</p>
          ) : (
            <div>
              <p style={{ marginTop: 0, fontWeight: "bold", marginBottom: "12px", color: "#ffffff" }}>
                Click a user to generate a reset code:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleUserClick(u.email)}
                    style={{
                      padding: "12px",
                      background: email === u.email ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.5)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: email === u.email ? "2px solid #ffffff" : "1px solid #666666",
                      transition: "all 0.2s",
                      color: "#ffffff"
                    }}
                    onMouseEnter={(e) => {
                      if (email !== u.email) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (email !== u.email) {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                      }
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#ffffff" }}>{u.name}</div>
                    <div style={{ fontSize: "12px", color: "#999999" }}>{u.email}</div>
                    {u.role === "executive" && (
                      <span style={{ 
                        fontSize: "10px", 
                        background: "#ffffff", 
                        color: "#000000", 
                        padding: "2px 6px", 
                        borderRadius: "4px",
                        marginTop: "4px",
                        display: "inline-block"
                      }}>
                        Executive
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleGenerateCode} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#ffffff" }}>
            User Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              fontSize: "14px",
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: "12px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "14px",
          }}>
            {error}
          </div>
        )}

        {generatedCode && (
          <div style={{
            padding: "20px",
            background: "rgba(0, 0, 0, 0.5)",
            border: "2px solid #ffffff",
            borderRadius: "12px",
          }}>
            <div style={{ marginBottom: "12px", fontWeight: "bold", color: "#ffffff" }}>
              ✅ Reset Code Generated Successfully!
            </div>
            <div style={{ marginBottom: "8px", color: "#ffffff" }}>
              <strong>User:</strong> {generatedCode.userName} ({generatedCode.email})
            </div>
            <div style={{
              margin: "16px 0",
              padding: "16px",
              background: "rgba(0, 0, 0, 0.8)",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
              <div style={{ fontSize: "12px", color: "#999999", marginBottom: "8px" }}>
                Reset Code:
              </div>
              <div style={{
                fontSize: "32px",
                fontWeight: "bold",
                letterSpacing: "8px",
                color: "#ffffff",
                fontFamily: "monospace",
              }}>
                {generatedCode.code}
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "#999999" }}>
              ⏰ Expires in: {generatedCode.expiresIn}
            </div>
            <div style={{ 
              marginTop: "12px", 
              padding: "12px", 
              background: "rgba(255, 255, 255, 0.1)", 
              borderRadius: "8px",
              fontSize: "12px",
              color: "#ffffff"
            }}>
              💡 Give this code to the user. They can use it on the "Forgot Password" page to reset their password.
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: loading ? "#666666" : "#ffffff",
            color: loading ? "#ffffff" : "#000000",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Reset Code"}
        </button>
      </form>
    </div>
  );
}

