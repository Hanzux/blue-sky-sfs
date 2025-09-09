
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { navItems, adminNavItems } from '@/lib/nav-items';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-6" />
                        <span>Blue Sky Feeding</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                    pathname === item.href && 'bg-muted text-primary'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                         <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="admin" className="border-b-0">
                                <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline [&[data-state=open]>svg]:-rotate-90">
                                   System Admin
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid items-start pl-7 text-sm font-medium">
                                        {adminNavItems.map(item => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                                    pathname === item.href && 'text-primary'
                                                )}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </nav>
                </div>
            </div>
        </div>
    )
}
