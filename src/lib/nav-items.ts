
import { Home, Users, CalendarCheck, Soup, BarChart3, Package, Warehouse } from "lucide-react";

export const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/learner-enrollment', icon: Users, label: 'Learner Enrollment' },
    { href: '/dashboard/daily-attendance', icon: CalendarCheck, label: 'Daily Attendance' },
    { href: '/dashboard/meal-recording', icon: Soup, label: 'Meal Recording' },
    { href: '/dashboard/reporting', icon: BarChart3, label: 'Reporting' },
    { href: '/dashboard/food-items', icon: Package, label: 'Food Items' },
    { href: '/#', icon: Warehouse, label: 'Stock Tracking' },
  ];

export const adminNavItems = [
    { href: '/admin/users', icon: Users, label: 'User Management' },
]
