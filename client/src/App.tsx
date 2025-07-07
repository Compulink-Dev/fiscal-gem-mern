import { BrowserRouter as Router, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Receipts from "./pages/Receipts";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import Notifications from "./pages/Notifications";
import { NotFound } from "./pages/NotFound";
import Device from "./pages/Device";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/team" element={<Team />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/device" element={<Device />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster />
    </div>
  );
}

export default App;
