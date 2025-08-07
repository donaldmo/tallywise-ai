"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspacesTab from "./components/workspaces-tab"; // We will create this component next

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workspaces"); // Default to workspaces tab

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="workspaces" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Team members settings form goes here */}
              <p>Team members settings content...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Manage your pending invitations.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pending invitations settings form goes here */}
              <p>Pending invitations settings content...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces">
          <WorkspacesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}