

import { AuditTrail } from "@/components/audit-trail";
import DashboardLayout from "../dashboard/layout";

export default function SearchLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <DashboardLayout>
        {children}
        <div className="flex justify-center mt-8">
            <AuditTrail />
        </div>
      </DashboardLayout>
    );
  }
