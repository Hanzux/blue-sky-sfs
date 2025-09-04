
'use client';

import { usePathname } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';
import { ReportingTool } from '@/components/reporting-tool';


export default function DashboardPage() {
    const pathname = usePathname();

    if (pathname === '/dashboard/reporting') {
        return <Dashboard />;
    }
  return <Dashboard />;
}
