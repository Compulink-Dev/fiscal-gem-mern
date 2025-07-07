import { useState } from "react";
import { NavLink } from "react-router";
import {
  Calendar,
  Home,
  Inbox,
  Settings,
  Users,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";
import { useAuth } from "../../context/AuthContext";
import { Title } from "../Title";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Receipts", icon: FileText, path: "/receipts" },
  { title: "Team", icon: Users, path: "/team" },
  { title: "Calendar", icon: Calendar, path: "/calendar" },
  { title: "Notifications", icon: Inbox, path: "/notifications" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Sidebar
      className={`border-r relative ${isCollapsed ? "w-[80px]" : "w-64"}`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 z-10 rounded-full border bg-background p-1 hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Title collapsed={isCollapsed} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-green-600 text-white"
                            : "hover:bg-accent"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
