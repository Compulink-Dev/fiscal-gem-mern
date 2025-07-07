import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Loader } from "lucide-react";

const ProtectedRoute = () => {
  const { user } = useAuth();

  console.log("");

  if (!user) {
    return (
      <div>
        <div className="h-screen w-screen bg-green-300 flex items-center justify-center">
          <p className="">Loading</p> <Loader className="animate-spin" />
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
