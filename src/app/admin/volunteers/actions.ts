
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// This is a mock database. In a real application, you would use a database.
let volunteers = [
    { id: '1', name: 'Alice Wonder', email: 'alice.wonder@example.com', phone: '456-789-0123', school: 'Dotito Primary School' },
    { id: '2', name: 'Ben Carson', email: 'ben.carson@example.com', phone: '567-890-1234', school: 'Mahuhwe Primary School' },
    { id: '3', name: 'Cathy Brown', email: 'cathy.brown@example.com', phone: '678-901-2345', school: 'Kadohwata Primary School' },
];
let nextId = 4;

// --- Schemas ---
const volunteerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  school: z.string().min(1, 'Please select a school.'),
});

const deleteVolunteerSchema = z.object({
  id: z.string(),
});

// --- Server Actions ---

export async function getVolunteers() {
  // In a real app, you'd fetch from a database
  return Promise.resolve(volunteers);
}

export async function createVolunteer(prevState: any, formData: FormData) {
  const validatedFields = volunteerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check your entries.',
    };
  }

  const { name, email, phone, school } = validatedFields.data;

  try {
    const newVolunteer = { id: (nextId++).toString(), name, email, phone, school };
    volunteers.push(newVolunteer);
    revalidatePath('/admin/volunteers');
    return {
      type: 'success',
      message: `Volunteer ${name} created successfully.`,
    };
  } catch (error: any) {
    return {
      type: 'error',
      message: error.message,
    };
  }
}

export async function updateVolunteer(prevState: any, formData: FormData) {
    const validatedFields = volunteerSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success || !validatedFields.data.id) {
        return { type: 'error', message: 'Invalid data provided.' };
    }

    const { id, name, email, phone, school } = validatedFields.data;

    try {
        volunteers = volunteers.map(v => v.id === id ? { id, name, email, phone, school } : v);
        revalidatePath('/admin/volunteers');
        return { type: 'success', message: 'Volunteer updated successfully.' };
    } catch (error: any) {
        return { type: 'error', message: error.message };
    }
}

export async function deleteVolunteer(prevState: any, formData: FormData) {
    const validatedFields = deleteVolunteerSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { type: 'error', message: 'Invalid data provided.' };
    }
    
    const { id } = validatedFields.data;

    try {
        volunteers = volunteers.filter(v => v.id !== id);
        revalidatePath('/admin/volunteers');
        return { type: 'success', message: 'Volunteer deleted successfully.' };
    } catch (error: any) {
        return { type: 'error', message: error.message };
    }
}

export async function importVolunteers(newVolunteers: Omit<z.infer<typeof volunteerSchema>, 'id'>[]) {
    const volunteersToAdd = newVolunteers.map(volunteer => ({
        ...volunteer,
        id: (nextId++).toString()
    }));

    volunteers = [...volunteers, ...volunteersToAdd];
    revalidatePath('/admin/volunteers');
    
    return {
        type: 'success',
        message: `${newVolunteers.length} volunteers imported successfully.`
    }
}
