import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Plus,
  Search,
  User,
  UserPlus,
  Settings,
  MoreVertical,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member" | "guest";
  status: "active" | "pending" | "inactive";
  lastActive: string;
  avatar?: string;
}

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "admin",
      status: "active",
      lastActive: "2023-06-18T14:30:00",
      avatar: "https://github.com/shadcn.png",
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "manager",
      status: "active",
      lastActive: "2023-06-17T09:15:00",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael@example.com",
      role: "member",
      status: "active",
      lastActive: "2023-06-16T16:45:00",
    },
    {
      id: "4",
      name: "Emma Davis",
      email: "emma@example.com",
      role: "guest",
      status: "pending",
      lastActive: "2023-06-15T11:20:00",
    },
  ]);

  const filteredMembers = teamMembers.filter(
    (member: any) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: "Admin", variant: "default" },
      manager: { label: "Manager", variant: "secondary" },
      member: { label: "Member", variant: "outline" },
      guest: { label: "Guest", variant: "destructive" },
    };
    return roleMap[role as keyof typeof roleMap] || roleMap.member;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Active", variant: "default" },
      pending: { label: "Pending", variant: "outline" },
      inactive: { label: "Inactive", variant: "destructive" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  const handleUpdateRole = (id: string, newRole: string) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id
          ? { ...member, role: newRole as TeamMember["role"] }
          : member
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="button">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Select role" />
                </div>
                <Button className="w-full">Send Invitation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their permissions
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member): any => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadge(member.role).variant}>
                          {getRoleBadge(member.role).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(member.status).variant}>
                          {getStatusBadge(member.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatLastActive(member.lastActive)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No team members found
                        </p>
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Members</CardDescription>
              <CardTitle className="text-3xl">
                {teamMembers.filter((m) => m.status === "active").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Invitations</CardDescription>
              <CardTitle className="text-3xl">
                {teamMembers.filter((m) => m.status === "pending").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Members</CardDescription>
              <CardTitle className="text-3xl">{teamMembers.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Roles & Permissions</CardTitle>
            <CardDescription>
              Manage what team members can see and do in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Admin</TableCell>
                  <TableCell>
                    Full access to all features and settings
                  </TableCell>
                  <TableCell>
                    {teamMembers.filter((m) => m.role === "admin").length}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Manager</TableCell>
                  <TableCell>Can manage team members and content</TableCell>
                  <TableCell>
                    {teamMembers.filter((m) => m.role === "manager").length}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Member</TableCell>
                  <TableCell>Can view and create content</TableCell>
                  <TableCell>
                    {teamMembers.filter((m) => m.role === "member").length}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Guest</TableCell>
                  <TableCell>Limited view-only access</TableCell>
                  <TableCell>
                    {teamMembers.filter((m) => m.role === "guest").length}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
