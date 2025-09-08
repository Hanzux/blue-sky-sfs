
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { initialAuditLogs, type AuditLog } from '@/lib/audit-data';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 5;
// In a real app, this would come from an auth context
const MOCK_USER_ROLE = 'System Admin'; 

export function AuditTrail() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Simulate checking the user's role.
        // Replace this with actual role checking from your auth provider.
        if (MOCK_USER_ROLE === 'System Admin') {
            setLogs(initialAuditLogs);
            setIsAdmin(true);
        }
    }, []);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return logs.slice(startIndex, endIndex);
    }, [logs, currentPage]);

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);

    if (!isAdmin) {
        return null;
    }

    return (
        <Card className="w-full mt-8">
            <CardHeader>
                <CardTitle>Audit Trails</CardTitle>
                <CardDescription>A log of recent activities across the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Page</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLogs.length > 0 ? paginatedLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{log.user}</div>
                                        <Badge variant="secondary">{log.userRole}</Badge>
                                    </TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell className="text-muted-foreground">{log.page}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            )}
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
