import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// In development, use empty string to use Vite proxy
// In production, use VITE_API_BASE_URL or empty for same-origin
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const getApiUrl = (endpoint) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to check for existing token
  const [token, setToken] = useState(null);

  // Check for existing token on mount and restore session
  useEffect(() => {
    const checkExistingToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        // Verify the token with the backend
        try {
          const res = await axios.get(getApiUrl("/api/auth/verify"), {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          // Token is valid, restore session
          setUser(res.data.user);
          setToken(storedToken);
        } catch (error) {
          // Token is invalid or expired, clear it
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false); // Done checking
    };
    
    checkExistingToken();
  }, []);

  const verifyToken = useCallback(async (authToken) => {
    try {
      const res = await axios.get(getApiUrl("/api/auth/verify"), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(res.data.user);
      setToken(authToken);
      localStorage.setItem("token", authToken);
      return true;
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(getApiUrl("/api/auth/login"), { email, password });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          (error.code === "ERR_NETWORK" ? "Network error. Is the backend running?" : "Login failed");
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const res = await axios.post(getApiUrl("/api/auth/signup"), { email, password, name });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          (error.code === "ERR_NETWORK" ? "Network error. Is the backend running?" : "Signup failed");
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        getAuthHeaders,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

