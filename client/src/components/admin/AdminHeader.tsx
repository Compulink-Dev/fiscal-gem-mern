import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function AdminHeader() {
  // const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b bg-background w-full">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 w-[300px]" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{"user"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
