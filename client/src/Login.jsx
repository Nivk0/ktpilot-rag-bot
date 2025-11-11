import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Login({ onSwitchToSignup, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const result = await login(normalizedEmail, password);
    setLoading(false);

    if (!result.success) {
      // Check if it's a "user not found" error
      if (result.error === "Account not found" || result.code === "USER_NOT_FOUND") {
        setError("You don't have an account. Please create an account to continue.");
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="ktp-auth-container">
      <div className="ktp-auth-card">
        <div className="ktp-auth-header">
          <div className="ktp-logo-pill">
            <div className="ktp-logo-greek">ΚΘΠ</div>
            <div className="ktp-logo-name">KAPPA THETA PI</div>
            <div className="ktp-logo-chapter">MU CHAPTER</div>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your documents</p>
        </div>

        <form onSubmit={handleSubmit} className="ktp-auth-form">
          {error && (
            <div className="ktp-auth-error">
              {error}
              {error.includes("don't have an account") && (
                <div style={{ marginTop: "12px" }}>
                  <button 
                    type="button" 
                    onClick={onSwitchToSignup} 
                    className="ktp-auth-link"
                    style={{ 
                      fontWeight: "bold", 
                      textDecoration: "underline",
                      fontSize: "14px"
                    }}
                  >
                    Create an account here
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="ktp-auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="ktp-auth-field">
            <label>Password</label>
            <div className="ktp-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="ktp-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" className="ktp-auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="ktp-auth-switch">
          <p>
            Don't have an account?{" "}
            <button type="button" onClick={onSwitchToSignup} className="ktp-auth-link">
              Sign up
            </button>
          </p>
          <p style={{ marginTop: "8px" }}>
            <button type="button" onClick={onForgotPassword} className="ktp-auth-link">
              Forgot password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

