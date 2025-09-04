
import { Home, Users, CalendarCheck, Soup, BarChart3, Package, Warehouse } from "lucide-react";

export const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/#', icon: Users, label: 'Learner Enrollment' },
    { href: '/#', icon: CalendarCheck, label: 'Daily Attendance' },
    { href: '/#', icon: Soup, label: 'Meal Recording' },
    { href: '/dashboard/reporting', icon: BarChart3, label: 'Reporting' },
    { href: '/#', icon: Package, label: 'Food Items' },
    { href: '/#', icon: Warehouse, label: 'Stock Tracking' },
  ];

export const adminNavItems = [
    { href: '/admin/users', icon: Users, label: 'User Management' },
]
