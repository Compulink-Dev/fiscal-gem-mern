// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import  Invoices  from "./pages/Invoices";
import { Settings } from "./pages/Settings";
import Customers from "./pages/Customers";
import { Login } from "./pages/Login";
import { useAuthStore } from "../store/authStore";
import { LoadingScreen } from "../components/LoadingScreen";
import { AppLayout } from "../components/AppLayout";

export function App() {
  const { isAuthenticated, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}