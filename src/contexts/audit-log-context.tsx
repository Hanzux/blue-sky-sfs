
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// In a real app, this user info would come from an authentication context
const MOCK_USER = {
  name: 'lodzax@gmail.com',
  role: 'System Admin',
};

type AuditLog = {
  id: string;
  user: string;
  userRole: string;
  action: string;
  page: string;
  timestamp: string;
  details: string;
};

type AuditLogContextType = {
  logs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'user' | 'userRole' | 'timestamp' | 'page'>) => void;
};

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const pathname = usePathname();

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'user' | 'userRole' | 'timestamp' | 'page'>) => {
    const newLog: AuditLog = {
      ...log,
      id: (logs.length + 1).toString(),
      user: MOCK_USER.name,
      userRole: MOCK_USER.role,
      timestamp: new Date().toISOString(),
      page: pathname,
    };
    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  return (
    <AuditLogContext.Provider value={{ logs, addAuditLog }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}
