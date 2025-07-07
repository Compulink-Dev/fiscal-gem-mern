// src/renderer/src/pages/NotFound.tsx
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { Button } from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-8">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    </DashboardLayout>
  );
}
