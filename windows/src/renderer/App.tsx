import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Invoices } from "./pages/Invoices";
import { Settings } from "./pages/Settings";
import Customers from "./pages/Customers";

import {
  HomeIcon,
  FileTextIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";

export function App() {
  const handleLogout = () => {
    // Your logout logic here (e.g. clearing localStorage, calling logout API)
    console.log("User logged out");
  };

  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>
        <nav
          style={{
            width: "200px",
            padding: "20px",
            borderRight: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "20px" }}>Fiscal Gem</h1>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <NavLink to="/" style={navLinkStyle}>
                  {({ isActive }) => (
                    <span style={getLinkStyle(isActive)}>
                      <HomeIcon style={iconStyle} />
                      Home
                    </span>
                  )}
                </NavLink>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <NavLink to="/invoices" style={navLinkStyle}>
                  {({ isActive }) => (
                    <span style={getLinkStyle(isActive)}>
                      <FileTextIcon style={iconStyle} />
                      Invoices
                    </span>
                  )}
                </NavLink>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <NavLink to="/customers" style={navLinkStyle}>
                  {({ isActive }) => (
                    <span style={getLinkStyle(isActive)}>
                      <UsersIcon style={iconStyle} />
                      Customers
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" style={navLinkStyle}>
                  {({ isActive }) => (
                    <span style={getLinkStyle(isActive)}>
                      <SettingsIcon style={iconStyle} />
                      Settings
                    </span>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            style={{
              ...getLinkStyle(false),
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              outline: "none",
              width: "100%",
              marginTop: "20px",
            }}
          >
            <LogOutIcon style={iconStyle} />
            Logout
          </button>
        </nav>

        <main style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Base link styling (no underline)
const navLinkStyle = {
  textDecoration: "none",
};

// Shared link/icon style with active support
const getLinkStyle = (isActive: any) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 12px",
  borderRadius: "4px",
  backgroundColor: isActive ? "#007bff" : "transparent",
  color: isActive ? "#fff" : "#333",
  fontWeight: isActive ? "bold" : "normal",
  cursor: "pointer",
});

// Icon size
const iconStyle = {
  width: "20px",
  height: "20px",
};
