
'use server';

import { revalidatePath } from "next/cache";
import { initialLearners, type Learner } from "@/lib/data";

// This is a mock database. In a real application, you would use a database.
let learners: Learner[] = [...initialLearners];
let nextId = learners.length + 1;

export async function addLearners(newLearners: Omit<Learner, 'id' | 'code'>[]) {
    const learnersToAdd = newLearners.map(learner => ({
        ...learner,
        id: (nextId++).toString(),
        code: 'imported' // code will be generated on client
    }));

    // In a real app, you'd persist this to a DB
    // learners = [...learners, ...learnersToAdd];

    revalidatePath('/dashboard/learner-enrollment');
    
    return {
        type: 'success',
        message: `${newLearners.length} learners imported successfully.`
    }
}
