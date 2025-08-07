"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

interface Workspace {
  _id: string;
  name: string;
  owner: { name: string; email: string };
  members: { user: { _id: string; name: string; email: string }; role: string }[];
}

interface Invitation {
  _id: string;
  workspace: { name: string };
  inviter: { name: string; email: string };
  inviteeEmail: string;
  token: string;
  status: string;
  role: string;
}

export default function WorkspacesTab() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState<{ workspaceId: string; userId: string; currentRole: string } | null>(null);
  const [newMemberRole, setNewMemberRole] = useState("");

  useEffect(() => {
    fetchWorkspaces();
    fetchInvitations();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      } else {
        toast({
          title: "Error fetching workspaces",
          description: "Failed to load workspaces.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching workspaces.",
        variant: "destructive",
      });
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setSentInvitations(data.sent);
        setReceivedInvitations(data.received);
      } else {
        toast({
          title: "Error fetching invitations",
          description: "Failed to load invitations.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching invitations.",
        variant: "destructive",
      });
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName) {
      toast({
        title: "Error",
        description: "Workspace name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newWorkspaceName }),
      });

      if (res.ok) {
        toast({
          title: "Workspace created",
          description: `Workspace "${newWorkspaceName}" has been created.`,
        });
        setNewWorkspaceName("");
        fetchWorkspaces();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error creating workspace",
          description: errorData.message || "Failed to create workspace.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the workspace.",
        variant: "destructive",
      });
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedWorkspaceId || !inviteeEmail || !inviteRole) {
      toast({
        title: "Error",
        description: "All invitation fields are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          inviteeEmail,
          role: inviteRole,
        }),
      });

      if (res.ok) {
        toast({
          title: "Invitation sent",
          description: `Invitation sent to ${inviteeEmail} for the selected workspace.`,
        });
        setInviteeEmail("");
        setSelectedWorkspaceId("");
        setInviteRole("member");
        fetchInvitations();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error sending invitation",
          description: errorData.message || "Failed to send invitation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the invitation.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptInvitation = async (invitationToken: string) => {
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitationToken }),
      });

      if (res.ok) {
        toast({
          title: "Invitation accepted",
          description: "You have successfully joined the workspace.",
        });
        fetchWorkspaces();
        fetchInvitations();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error accepting invitation",
          description: errorData.message || "Failed to accept invitation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while accepting the invitation.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineInvitation = async (invitationToken: string) => {
    if (!confirm("Are you sure you want to decline this invitation?")) {
      return;
    }
    try {
      const res = await fetch("/api/invitations/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitationToken }),
      });

      if (res.ok) {
        toast({
          title: "Invitation declined",
          description: "You have successfully declined the invitation.",
        });
        fetchInvitations();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error declining invitation",
          description: errorData.message || "Failed to decline invitation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while declining the invitation.",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async () => {
    if (!memberToChangeRole || !newMemberRole) return;

    try {
      const res = await fetch(
        `/api/workspaces/${memberToChangeRole.workspaceId}/members/${memberToChangeRole.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newMemberRole }),
        }
      );

      if (res.ok) {
        toast({
          title: "Role updated",
          description: "Member role has been successfully updated.",
        });
        fetchWorkspaces();
        setIsChangeRoleDialogOpen(false);
        setMemberToChangeRole(null);
        setNewMemberRole("");
      } else {
        const errorData = await res.json();
        toast({
          title: "Error updating role",
          description: errorData.message || "Failed to update member role.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while changing the member role.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (workspaceId: string, userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this workspace?`)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast({
          title: "Member removed",
          description: `${userName} has been removed from the workspace.`,
        });
        fetchWorkspaces();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error removing member",
          description: errorData.message || "Failed to remove member.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing the member.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      {/* Create New Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Workspace</CardTitle>
          <CardDescription>Create a new collaborative space for your team.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="workspaceName">Workspace Name</Label>
            <Input
              id="workspaceName"
              placeholder="Enter workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateWorkspace}>Create Workspace</Button>
        </CardContent>
      </Card>

      {/* Invite Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>Send invitations to new members to join your workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="selectWorkspace">Select Workspace</Label>
            <Select onValueChange={setSelectedWorkspaceId} value={selectedWorkspaceId}>
              <SelectTrigger id="selectWorkspace">
                <SelectValue placeholder="Select a workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((ws) => (
                  <SelectItem key={ws._id} value={ws._id}>
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inviteeEmail">Invitee Email</Label>
            <Input
              id="inviteeEmail"
              type="email"
              placeholder="Enter invitee email address"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inviteRole">Role</Label>
            <Select onValueChange={setInviteRole} value={inviteRole}>
              <SelectTrigger id="inviteRole">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSendInvitation} disabled={!selectedWorkspaceId || !inviteeEmail || !inviteRole}>
            Send Invitation
          </Button>
        </CardContent>
      </Card>

      {/* Your Workspaces */}
      <Card>
        <CardHeader>
          <CardTitle>Your Workspaces</CardTitle>
          <CardDescription>Manage your existing workspaces and their members.</CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <p>You are not a member of any workspaces yet.</p>
          ) : (
            workspaces.map((ws) => (
              <div key={ws._id} className="mb-6 border-b pb-4 last:mb-0 last:border-b-0">
                <h3 className="text-lg font-semibold">{ws.name}</h3>
                <p className="text-sm text-gray-500">Owner: {ws.owner.name} ({ws.owner.email})</p>
                <h4 className="mt-4 mb-2 text-md font-medium">Members:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ws.members.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell>{member.user.name}</TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="flex gap-2">
                          <Dialog
                            open={isChangeRoleDialogOpen && memberToChangeRole?.userId === member.user._id}
                            onOpenChange={setIsChangeRoleDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={member.user.email === ws.owner.email} // Disable for owner
                                onClick={() => {
                                  setMemberToChangeRole({ workspaceId: ws._id, userId: member.user._id, currentRole: member.role });
                                  setNewMemberRole(member.role); // Set initial value to current role
                                  setIsChangeRoleDialogOpen(true);
                                }}
                              >
                                Change Role
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Role for {member.user.name}</DialogTitle>
                                <DialogDescription>
                                  Select a new role for this member in "{ws.name}".
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-2 py-4">
                                <Label htmlFor="newRole">New Role</Label>
                                <Select onValueChange={setNewMemberRole} value={newMemberRole}>
                                  <SelectTrigger id="newRole">
                                    <SelectValue placeholder="Select new role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="guest">Guest</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsChangeRoleDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleChangeRole}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMember(ws._id, member.user._id, member.user.name)}
                            disabled={member.user.email === ws.owner.email} // Prevent removing the owner via this button
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Sent Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
          <CardDescription>View the status of invitations you have sent.</CardDescription>
        </CardHeader>
        <CardContent>
          {sentInvitations.length === 0 ? (
            <p>You have not sent any invitations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Invitee Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentInvitations.map((invite) => (
                  <TableRow key={invite._id}>
                    <TableCell>{invite.workspace.name}</TableCell>
                    <TableCell>{invite.inviteeEmail}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell>{invite.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Received Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Received Invitations</CardTitle>
          <CardDescription>Invitations sent to you to join workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
          {receivedInvitations.length === 0 ? (
            <p>You have no pending invitations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Inviter</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedInvitations.map((invite) => (
                  <TableRow key={invite._id}>
                    <TableCell>{invite.workspace.name}</TableCell>
                    <TableCell>{invite.inviter.email}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button onClick={() => handleAcceptInvitation(invite.token)} size="sm">
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineInvitation(invite.token)}
                      >
                        Decline
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}