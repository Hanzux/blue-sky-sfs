
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { navItems, adminNavItems } from '@/lib/nav-items';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AuditTrail } from '@/components/audit-trail';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.startsWith('/admin')) {
      return 'admin';
    }
    // Find if the current path is a child of a nav item
    const parentNav = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard');
    if (parentNav) return parentNav.href;

    return pathname;
  }

  const showAuditTrail = pathname !== '/dashboard';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className='flex flex-col sm:gap-4 sm:py-4'>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className='mb-4'>
            <Tabs value={getActiveTab()} className="w-full">
              <div className="flex justify-center">
                <TabsList className='hidden md:inline-flex'>
                  {navItems.map(item => (
                    <TabsTrigger key={item.label} value={item.href} asChild>
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Link>
                    </TabsTrigger>
                  ))}
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-auto rounded-none border-0 bg-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                            System Admin
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                          {adminNavItems.map(item => (
                              <DropdownMenuItem key={item.label} asChild>
                                  <Link href={item.href}>
                                      <item.icon className="w-4 h-4 mr-2" />
                                      {item.label}
                                  </Link>
                              </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                  </DropdownMenu>
                </TabsList>
              </div>
            </Tabs>
          </div>
          {children}
          {showAuditTrail && (
            <div className="flex justify-center">
                <AuditTrail />
            </div>
           )}
        </main>
      </div>
    </div>
  );
}
