import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Bell, BellOff, Check, X, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "system" | "alert" | "message";
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New update available",
      message: "Version 2.3.0 is now available with new features",
      date: "2023-06-15T10:30:00",
      read: false,
      type: "system",
    },
    {
      id: "2",
      title: "Payment received",
      message: "Your invoice #12345 has been paid",
      date: "2023-06-14T14:45:00",
      read: true,
      type: "alert",
    },
    {
      id: "3",
      title: "New message from support",
      message: "We have responded to your ticket #54321",
      date: "2023-06-13T09:15:00",
      read: false,
      type: "message",
    },
  ]);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  const getTypeBadge = (type: string) => {
    const typeMap = {
      system: { label: "System", variant: "default" },
      alert: { label: "Alert", variant: "destructive" },
      message: { label: "Message", variant: "outline" },
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.system;
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6" />
              <CardTitle>Notifications</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {notifications.filter((n) => !n.read).length} unread
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showUnreadOnly ? "Show all" : "Unread only"}
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={
                  !notification.read ? "border-l-4 border-l-primary" : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge>{getTypeBadge(notification.type).label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BellOff className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">
                  {showUnreadOnly
                    ? "No unread notifications"
                    : "No notifications"}
                </h3>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
