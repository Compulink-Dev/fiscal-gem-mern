// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Fiscal Gem</h2>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-submit">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CSS Styles
const styles = `
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.login-card {
  max-width: 28rem;
  width: 70%;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.login-header {
  margin-bottom: 1.5rem;
}

.login-header h2 {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1a202c;
}

.error-message {
  background-color: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.login-form {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input {
  appearance: none;
  position: relative;
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d2d6dc;
  border-radius: 0.375rem;
  color: #1a202c;
  background-color: white;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

.submit-button {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background-color: #0F4D0F;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #008000;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);