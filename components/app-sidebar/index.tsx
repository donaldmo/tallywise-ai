"use client"

import * as React from "react"
import { Book, Briefcase, FileText, Settings, Bell, MessageSquare, Command } from "lucide-react"
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ContentSidebar } from "./content-sidebar"
import { useEffect } from "react"

import { useRouter, useSearchParams } from "next/navigation";

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

const navMain = [
  {
    title: "Accounting",
    url: "/accounting",
    icon: Book,
    isActive: true,
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: Briefcase,
    isActive: false,
  },
  {
    title: "Files",
    url: "/files",
    icon: FileText,
    isActive: false,
  },
  {
    title: "Notification",
    url: "/notifications",
    icon: Bell,
    isActive: false,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    isActive: false,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    isActive: false,
  },
]

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("activeItem");

  const [activeItem, setActiveItem] = React.useState(navMain[0])
  const { setOpen } = useSidebar()

  useEffect(() => {
    if (paramValue) {
      setActiveItem(navMain.find(item => item.title === paramValue) || navMain[0]);
    }
  }, [paramValue]);

  console.log('activeItem: ', activeItem)

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* Icon Sidebar */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)

                        router.push(`/dashboard/${item.url}?activeItem=${item.title}`)

                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>

      {/* Content Sidebar */}
      {/* {renderSidebar(activeItem)} */}

      <ContentSidebar activeItem={activeItem} />
    </Sidebar>
  )
}