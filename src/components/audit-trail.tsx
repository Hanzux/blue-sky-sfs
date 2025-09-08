
'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuditLog } from '@/contexts/audit-log-context';

const ITEMS_PER_PAGE = 5;
// In a real app, this would come from an auth context
const MOCK_USER_ROLE = 'System Admin'; 

export function AuditTrail() {
    const pathname = usePathname();
    const { logs } = useAuditLog();
    const [currentPage, setCurrentPage] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Simulate checking the user's role.
        // Replace this with actual role checking from your auth provider.
        if (MOCK_USER_ROLE === 'System Admin') {
            setIsAdmin(true);
        }
    }, []);

    const filteredLogs = useMemo(() => {
        if (!isAdmin) return [];
        // Filter logs to only show entries relevant to the current page
        return logs.filter(log => log.page === pathname);
    }, [pathname, isAdmin, logs]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredLogs.slice(startIndex, endIndex);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    if (!isAdmin || filteredLogs.length === 0) {
        return null;
    }

    return (
        <Card className="w-full mt-8">
            <CardHeader>
                <CardTitle>Audit Trails</CardTitle>
                <CardDescription>A log of recent activities on this page.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{log.user}</div>
                                        <Badge variant="secondary">{log.userRole}</Badge>
                                    </TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
