"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspacesTab from "./components/workspaces-tab"; // We will create this component next

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workspaces"); // Default to workspaces tab

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="workspaces" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your profile information.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Profile settings form goes here */}
              <p>Profile settings content...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Account settings form goes here */}
              <p>Account settings content...</p>
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