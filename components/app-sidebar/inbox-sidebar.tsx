import * as React from "react"
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
} from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import { TeamSwitcher } from "../team-switcher"
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react"

interface Mail {
  name: string
  email: string
  subject: string
  date: string
  teaser: string
}

interface InboxSidebarProps {
  activeItem: {
    title: string
  }
  mails: Mail[]
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ]
}

export function InboxSidebar({ activeItem, mails }: InboxSidebarProps) {
  return (
    <Sidebar collapsible="none" className="flex-1">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <TeamSwitcher teams={data.teams} />

        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            {activeItem.title}
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {mails.map((mail) => (
              <a
                href="#"
                key={mail.email}
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
              >
                <div className="flex w-full items-center gap-2">
                  <span>{mail.name}</span>
                  <span className="ml-auto text-xs">{mail.date}</span>
                </div>
                <span className="font-medium">{mail.subject}</span>
                <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                  {mail.teaser}
                </span>
              </a>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}