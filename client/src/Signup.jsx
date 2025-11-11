import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Signup({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const result = await signup(normalizedEmail, password, name);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="ktp-auth-container">
      <div className="ktp-auth-card">
        <div className="ktp-auth-header">
          <div className="ktp-logo-pill">
            <div className="ktp-logo-dot" />
            <span>KTPilot</span>
          </div>
          <h2>Create Account</h2>
          <p>Sign up to get started with KTPilot</p>
        </div>

        <form onSubmit={handleSubmit} className="ktp-auth-form">
          {error && <div className="ktp-auth-error">{error}</div>}

          <div className="ktp-auth-field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={loading}
            />
          </div>

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
                placeholder="At least 6 characters"
                required
                minLength={6}
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

          <div className="ktp-auth-field">
            <label>Confirm Password</label>
            <div className="ktp-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="ktp-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" className="ktp-auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="ktp-auth-switch">
          <p>
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="ktp-auth-link">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

