
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Users,
  CalendarCheck,
  Soup,
  BarChart3,
  Package,
  Warehouse,
  Shield,
  CircleUser,
  Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '#', icon: Users, label: 'Learner Enrollment' },
  { href: '#', icon: CalendarCheck, label: 'Daily Attendance' },
  { href: '#', icon: Soup, label: 'Meal Recording' },
  { href: '/dashboard/reporting', icon: BarChart3, label: 'Reporting', badge: 'AI' },
  { href: '#', icon: Package, label: 'Food Items' },
  { href: '#', icon: Warehouse, label: 'Stock Tracking' },
];

const adminNavItems = [
    { href: '/admin/users', icon: Users, label: 'User Management' },
]

export function Header() {
    const pathname = usePathname();

    return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
                <Logo className="h-6 w-6" />
                <span className="sr-only">Blue Sky</span>
            </Link>
             {navItems.map((item) => (
                <Link
                key={item.label}
                href={item.href}
                className={cn(
                    "transition-colors hover:text-foreground",
                    pathname === item.href ? "text-foreground" : "text-muted-foreground"
                )}
                >
                {item.label}
                {item.badge && <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">{item.badge}</Badge>}
                </Link>
            ))}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                    "transition-colors hover:text-foreground -ml-3",
                    pathname.startsWith('/admin') ? "text-foreground" : "text-muted-foreground"
                )}>
                  System Admin
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {adminNavItems.map(item => (
                    <DropdownMenuItem key={item.label} asChild>
                        <Link href={item.href}>
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
        </nav>
        <Sheet>
        <SheetTrigger asChild>
            <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold"
                >
                    <Logo className="h-6 w-6" />
                    <span >Blue Sky</span>
                </Link>
                {navItems.map((item) => (
                    <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "transition-colors hover:text-foreground",
                        pathname === item.href ? "text-foreground" : "text-muted-foreground"
                    )}
                    >
                    {item.label}
                    {item.badge && <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">{item.badge}</Badge>}
                    </Link>
                ))}
                <div className="border-t pt-4">
                     <h4 className="font-semibold mb-2">System Admin</h4>
                    {adminNavItems.map(item => (
                        <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "transition-colors hover:text-foreground block py-2",
                            pathname === item.href ? "text-foreground" : "text-muted-foreground"
                        )}
                        >
                        {item.label}
                        </Link>
                    ))}
                </div>

            </nav>
        </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial">
                {/* Optional Search */}
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person face" />
                            <AvatarFallback>SH</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">Logout</Link>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
    )
}
