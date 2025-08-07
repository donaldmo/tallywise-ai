import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions';
import AppSidebar from '@/components/app-sidebar/index'

import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import MainHeader from '@/components/main-header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  console.log('Session:', session);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      
      <SidebarInset>
        <MainHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}