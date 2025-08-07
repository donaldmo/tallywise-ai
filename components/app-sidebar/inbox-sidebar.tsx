import * as React from "react"

interface Mail {
  name: string
  email: string
  subject: string
  date: string
  teaser: string
}

interface InboxSidebarProps {
 mails: Mail[]
}

export function InboxSidebar({ mails }: InboxSidebarProps) {
  return (
    <div>
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
    </div>
  )
}