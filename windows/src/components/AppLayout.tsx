// src/components/AppLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  HomeIcon,
  FileTextIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  Receipt,
} from "lucide-react";
import { Title } from "./Title";

export function AppLayout() {
  const { logout, user } = useAuthStore();

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-content">
        <Title/>
          <div className="user-info">
<div className="flex items-center" style={{gap:4}}>
              <div className="user-avatar">{user?.firstName.charAt(0)}{user?.lastName.charAt(0)}</div>
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">
                {({ isActive }) => (
                  <div className={isActive ? "nav-active" : "nav-inactive"}>
                    <HomeIcon className="nav-icon" />
                   <p className="nav-title"> Home</p>
                  </div>
                )}
              </NavLink>
            </li>
                  <li className="nav-item">
              <NavLink to="/invoices" className="nav-link">
                {({ isActive }) => (
                  <div className={isActive ? "nav-active" : "nav-inactive"}>
                    <Receipt className="nav-icon" />
                    <p className="nav-title">Invoice</p>
                  </div>
                )}
              </NavLink>
            </li>
            {/* Other nav items */}
          </ul>
        </div>
        <button onClick={logout} className="logout-button mt-auto">
          <LogOutIcon className="nav-icon" />
          <p className="nav-title">Logout</p>
        </button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}