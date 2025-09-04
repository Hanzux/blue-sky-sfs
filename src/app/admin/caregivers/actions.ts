'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// This is a mock database. In a real application, you would use a database.
let caregivers = [
    { id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '123-456-7890' },
    { id: '2', name: 'Bob Smith', email: 'bob.smith@example.com', phone: '234-567-8901' },
    { id: '3', name: 'Chris Johnson', email: 'chris.johnson@example.com', phone: '345-678-9012' },
];
let nextId = 4;

// --- Schemas ---
const caregiverSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

const deleteCaregiverSchema = z.object({
  id: z.string(),
});

// --- Server Actions ---

export async function getCaregivers() {
  // In a real app, you'd fetch from a database
  return Promise.resolve(caregivers);
}

export async function createCaregiver(prevState: any, formData: FormData) {
  const validatedFields = caregiverSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check your entries.',
    };
  }

  const { name, email, phone } = validatedFields.data;

  try {
    const newCaregiver = { id: (nextId++).toString(), name, email, phone };
    caregivers.push(newCaregiver);
    revalidatePath('/admin/caregivers');
    return {
      type: 'success',
      message: `Caregiver ${name} created successfully.`,
    };
  } catch (error: any) {
    return {
      type: 'error',
      message: error.message,
    };
  }
}

export async function updateCaregiver(prevState: any, formData: FormData) {
    const validatedFields = caregiverSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success || !validatedFields.data.id) {
        return { type: 'error', message: 'Invalid data provided.' };
    }

    const { id, name, email, phone } = validatedFields.data;

    try {
        caregivers = caregivers.map(c => c.id === id ? { id, name, email, phone } : c);
        revalidatePath('/admin/caregivers');
        return { type: 'success', message: 'Caregiver updated successfully.' };
    } catch (error: any) {
        return { type: 'error', message: error.message };
    }
}

export async function deleteCaregiver(prevState: any, formData: FormData) {
    const validatedFields = deleteCaregiverSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { type: 'error', message: 'Invalid data provided.' };
    }
    
    const { id } = validatedFields.data;

    try {
        caregivers = caregivers.filter(c => c.id !== id);
        revalidatePath('/admin/caregivers');
        return { type: 'success', message: 'Caregiver deleted successfully.' };
    } catch (error: any) {
        return { type: 'error', message: error.message };
    }
}
