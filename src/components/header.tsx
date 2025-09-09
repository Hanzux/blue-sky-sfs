
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  Search,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { navItems, adminNavItems } from '@/lib/nav-items';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (pathname === '/search' || searchQuery.trim() !== '') {
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, router, pathname]);

     const getActiveTab = () => {
        if (pathname.startsWith('/admin')) {
          return 'admin';
        }
        // Find if the current path is a child of a nav item
        const parentNav = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard');
        if (parentNav) return parentNav.href;

        return pathname;
    }

    return (
    <header className="sticky top-0 z-30 flex flex-col border-b bg-background">
        <div className='flex h-16 items-center gap-4 px-4 sm:px-6'>
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
                            "flex items-center gap-4 transition-colors hover:text-foreground",
                            pathname === item.href ? "text-foreground" : "text-muted-foreground"
                        )}
                        >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                        </Link>
                    ))}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">System Admin</h4>
                        {adminNavItems.map(item => (
                            <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 transition-colors hover:text-foreground py-2",
                                pathname === item.href ? "text-foreground" : "text-muted-foreground"
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                            </Link>
                        ))}
                    </div>

                </nav>
            </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className='flex items-center gap-2'>
                    <Logo className="h-6 w-6" />
                    <h1 className='font-headline text-lg hidden sm:block'>Blue Sky School Feeding</h1>
                </div>

                <div className="ml-auto flex-1 sm:flex-initial">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
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
        </div>
        <div className='border-t'>
              <Tabs value={getActiveTab()} className="w-full">
                <div className="flex justify-center">
                  <TabsList className='hidden md:inline-flex h-14'>
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
    </header>
    )
}
