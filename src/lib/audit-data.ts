export type AuditLog = {
    id: string;
    user: string;
    userRole: string;
    action: string;
    page: string;
    timestamp: string;
    details: string;
};

export const initialAuditLogs: AuditLog[] = [
    {
        id: '1',
        user: 'lloyd@example.com',
        userRole: 'System Admin',
        action: 'User Created',
        page: '/admin/users',
        timestamp: '2024-07-30T10:00:00Z',
        details: 'Created new user "test@example.com" with role "Teacher".',
    },
    {
        id: '2',
        user: 'coordinator@example.com',
        userRole: 'Project Coordinator',
        action: 'School Edited',
        page: '/dashboard/school-registration',
        timestamp: '2024-07-30T10:05:00Z',
        details: 'Updated learner count for "Dotito Primary School" to 105.',
    },
    {
        id: '3',
        user: 'teacher@example.com',
        userRole: 'Teacher',
        action: 'Attendance Recorded',
        page: '/dashboard/daily-attendance',
        timestamp: '2024-07-30T10:10:00Z',
        details: 'Recorded attendance for "Grade 1" at "Kadohwata Primary School".',
    },
    {
        id: '4',
        user: 'lloyd@example.com',
        userRole: 'System Admin',
        action: 'Password Reset',
        page: '/admin/users',
        timestamp: '2024-07-30T10:15:00Z',
        details: 'Reset password for user "teacher@example.com".',
    },
    {
        id: '5',
        user: 'clerk@example.com',
        userRole: 'Store Clerk',
        action: 'Stock Adjusted',
        page: '/dashboard/stock-tracking',
        timestamp: '2024-07-30T10:20:00Z',
        details: 'Subtracted 10kg of "Maize Meal" from stock.',
    },
    {
        id: '6',
        user: 'coordinator@example.com',
        userRole: 'Project Coordinator',
        action: 'Learner Enrolled',
        page: '/dashboard/learner-enrollment',
        timestamp: '2024-07-30T10:25:00Z',
        details: 'Enrolled new learner "Sarah Jones".',
    },
    {
        id: '7',
        user: 'cook@example.com',
        userRole: 'Cook',
        action: 'Meal Recorded',
        page: '/dashboard/meal-recording',
        timestamp: '2024-07-30T10:30:00Z',
        details: 'Recorded "Lunch" for "Grade 2" at "Dotito Primary School".',
    },
    {
        id: '8',
        user: 'lloyd@example.com',
        userRole: 'System Admin',
        action: 'Caregiver Deleted',
        page: '/admin/caregivers',
        timestamp: '2024-07-30T10:35:00Z',
        details: 'Deleted caregiver "Bob Smith".',
    },
     {
        id: '9',
        user: 'coordinator@example.com',
        userRole: 'Project Coordinator',
        action: 'Report Generated',
        page: '/dashboard/data-reports',
        timestamp: '2024-07-30T10:40:00Z',
        details: 'Generated "Attendance by District/School" report for "Mt Darwin".',
    },
    {
        id: '10',
        user: 'clerk@example.com',
        userRole: 'Store Clerk',
        action: 'Food Item Added',
        page: '/dashboard/food-items',
        timestamp: '2024-07-30T10:45:00Z',
        details: 'Added new food item "Rice" (200kg).',
    },
];
