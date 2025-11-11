import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const getApiUrl = (endpoint) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code and new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // Track if email was sent successfully

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      if (!normalizedEmail) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      const res = await axios.post(getApiUrl("/api/auth/request-reset-code"), { email: normalizedEmail });
      
      // Handle response based on email configuration
      // IMPORTANT: Check emailSent FIRST to avoid showing code when email was sent
      if (res.data.emailSent === true) {
        // Email sent successfully - don't show code, user should check email
        // Clear any existing code from state and mark email as sent
        setCode("");
        setEmailSent(true);
        setSuccess(
          `✅ Reset code sent!\n\n` +
          `📧 A reset code has been sent to ${normalizedEmail}\n\n` +
          `Please check your email inbox (and spam folder) for the 6-digit code.\n\n` +
          `Code expires in ${res.data.expiresIn || "30 minutes"}.`
        );
        setStep(2);
      } else if (res.data.code && res.data.emailSent === false) {
        // Email not configured - code is returned in response for display
        setCode(res.data.code);
        setEmailSent(false); // Email was not sent
        setSuccess(
          `✅ Reset code generated!\n\n` +
          `⚠️ Email service is not configured.\n\n` +
          `Your reset code is displayed below. Please configure SMTP settings (see QUICK_EMAIL_SETUP.md) to receive codes via email.`
        );
        setStep(2);
      } else {
        // Generic response (user might not exist, but we don't reveal that)
        // Assume email was sent (even if user doesn't exist, for security)
        setCode("");
        setEmailSent(true); // Assume email was sent (don't show code)
        setSuccess(
          `✅ If an account exists with this email, a reset code has been sent.\n\n` +
          `📧 Please check your email inbox (and spam folder) for the 6-digit code.\n\n` +
          `Code expires in ${res.data.expiresIn || "30 minutes"}.`
        );
        setStep(2);
      }
    } catch (error) {
      console.error("Request reset code error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to request reset code. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs
    if (!email || !email.trim()) {
      setError("Email is required");
      return;
    }

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit reset code");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      const res = await axios.post(getApiUrl("/api/auth/reset-password"), {
        email: normalizedEmail,
        code: code.trim(),
        newPassword,
      });
      
      setSuccess(res.data.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to reset password. Please check your code and try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
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
          <h2>Reset Password</h2>
          <p>
            {step === 1
              ? "Enter your email to receive a reset code"
              : "Enter the reset code from your email and your new password"}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="ktp-auth-form">
            {error && <div className="ktp-auth-error" style={{ whiteSpace: "pre-line" }}>{error}</div>}
            {success && <div className="ktp-auth-success" style={{ whiteSpace: "pre-line" }}>{success}</div>}

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

            <div className="ktp-auth-info">
              <p>
                Enter your email address and we'll send you a reset code. 
                Check your inbox for the 6-digit code.
              </p>
            </div>

            <button type="submit" className="ktp-auth-submit" disabled={loading}>
              {loading ? "Sending code..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="ktp-auth-form">
            {error && <div className="ktp-auth-error">{error}</div>}
            {success && <div className="ktp-auth-success">{success}</div>}

            {/* Display reset code prominently ONLY if email is not configured AND code exists in response */}
            {/* Do NOT show code if email was sent successfully */}
            {code && code.length === 6 && !emailSent && (
              <div className="ktp-auth-info" style={{ 
                marginBottom: "20px", 
                padding: "16px", 
                backgroundColor: "#f5f5f5", 
                border: "2px solid #000",
                borderRadius: "8px",
                textAlign: "center" 
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "bold", color: "#d32f2f" }}>
                  ⚠️ Email Not Configured - Code Displayed Below
                </p>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "bold" }}>
                  🔑 Your Reset Code:
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: "32px", 
                  fontWeight: "bold", 
                  letterSpacing: "8px",
                  color: "#000",
                  fontFamily: "monospace"
                }}>
                  {code}
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
                  Code expires in 30 minutes
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#999", fontStyle: "italic" }}>
                  Configure SMTP in server/.env to receive codes via email
                </p>
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
              <label>Reset Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                disabled={loading}
                style={{ letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
              />
            </div>

            <div className="ktp-auth-field">
              <label>New Password</label>
              <div className="ktp-password-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="ktp-password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="ktp-auth-field">
              <label>Confirm New Password</label>
              <div className="ktp-password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
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
              {loading ? "Resetting password..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
                setEmailSent(false);
              }}
              className="ktp-auth-link"
              style={{ marginTop: "8px" }}
            >
              ← Back to request code
            </button>
          </form>
        )}

        <div className="ktp-auth-switch">
          <p>
            Remembered your password?{" "}
            <button type="button" onClick={onBackToLogin} className="ktp-auth-link">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

