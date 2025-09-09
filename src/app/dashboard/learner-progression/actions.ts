
'use server';

import { revalidatePath } from "next/cache";
import { initialLearners, type Learner } from "@/lib/data";
import { z } from 'zod';

// This is a mock database. In a real application, you would use a database.
// We add a status to each learner for this feature.
let learners: (Learner & { status: 'Active' | 'Promoted' | 'Retained' | 'Dropped Out' })[] = 
    initialLearners.map(l => ({ ...l, status: 'Active' }));

export async function getLearnersWithStatus() {
    // In a real app, you'd fetch from a database
    return Promise.resolve(learners);
}

const updateLearnerStatusSchema = z.object({
  learnerId: z.string(),
  status: z.enum(['Active', 'Promoted', 'Retained', 'Dropped Out']),
});

export async function updateLearnerStatus(prevState: any, formData: FormData) {
    const validatedFields = updateLearnerStatusSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Invalid data provided.',
        };
    }
    
    const { learnerId, status } = validatedFields.data;

    const learnerIndex = learners.findIndex(l => l.id === learnerId);

    if (learnerIndex === -1) {
        return { type: 'error', message: 'Learner not found.' };
    }

    try {
        learners[learnerIndex].status = status;
        revalidatePath('/dashboard/learner-progression');
        return {
            type: 'success',
            message: `Learner status updated to ${status}.`,
        };
    } catch (error: any) {
        return {
            type: 'error',
            message: error.message,
        };
    }
}

const promoteClassSchema = z.object({
    school: z.string(),
    className: z.string(),
    newClassName: z.string().min(1, 'New class name is required.'),
});

export async function promoteClass(prevState: any, formData: FormData) {
    const validatedFields = promoteClassSchema.safeParse(
        Object.fromEntries(formData.entries())
    );
     if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Invalid data provided for class promotion.',
        };
    }
    const { school, className, newClassName } = validatedFields.data;

    let promotedCount = 0;
    learners.forEach(learner => {
        if (learner.school === school && learner.className === className && learner.status === 'Active') {
            learner.status = 'Promoted';
            learner.className = newClassName; // This now correctly updates the class name
            promotedCount++;
        }
    });

    revalidatePath('/dashboard/learner-progression');
    return {
        type: 'success',
        message: `Successfully promoted ${promotedCount} learners from ${className} to ${newClassName} at ${school}.`,
    };
}
