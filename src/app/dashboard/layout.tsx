
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { AuditTrail } from '@/components/audit-trail';
import { AuditLogProvider } from '@/contexts/audit-log-context';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showAuditTrail = pathname !== '/dashboard';

  return (
    <AuditLogProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              {children}
              {showAuditTrail && (
                <div className="flex justify-center mt-8">
                    <AuditTrail />
                </div>
              )}
            </main>
        </div>
      </div>
    </AuditLogProvider>
  );
}
