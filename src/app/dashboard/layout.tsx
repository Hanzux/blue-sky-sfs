
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { AuditTrail } from '@/components/audit-trail';
import { AuditLogProvider } from '@/contexts/audit-log-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showAuditTrail = pathname !== '/dashboard';

  return (
    <AuditLogProvider>
      <div className="flex min-h-screen w-full flex-col">
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
    </AuditLogProvider>
  );
}
