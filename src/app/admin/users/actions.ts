'use server';

import { getAdminAuth } from '@/lib/firebase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// --- Schemas ---
const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const updateUserSchema = z.object({
  uid: z.string(),
  name: z.string().min(3),
  email: z.string().email(),
});

const deleteUserSchema = z.object({
  uid: z.string(),
});

// --- Server Actions ---

export async function getUsers() {
  const adminAuth = await getAdminAuth();
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized.');
  }

  try {
    const userRecords = await adminAuth.listUsers();
    return userRecords.users.map(user => ({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      createdAt: user.metadata.creationTime,
    }));
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function createUser(prevState: any, formData: FormData) {
  const adminAuth = await getAdminAuth();
  if (!adminAuth) {
    return {
      type: 'error',
      message: 'Firebase Admin SDK is not initialized.',
    };
  }

  const validatedFields = createUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check your entries.',
    };
  }

  const { email, password, name } = validatedFields.data;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    
    revalidatePath('/admin/users');
    return {
      type: 'success',
      message: `User ${name} created successfully.`,
    };
  } catch (error: any) {
    return {
      type: 'error',
      message: error.message,
    };
  }
}

export async function updateUser(prevState: any, formData: FormData) {
    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
        return { type: 'error', message: 'Firebase Admin SDK not initialized.' };
    }

    const validatedFields = updateUserSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { type: 'error', message: 'Invalid data provided.' };
    }

    const { uid, name, email } = validatedFields.data;

    try {
        await adminAuth.updateUser(uid, {
            displayName: name,
            email: email,
        });
        revalidatePath('/admin/users');
        return { type: 'success', message: 'User updated successfully.' };
    } catch (error: any) {
        return { type: 'error', message: error.message };
    }
}

export async function deleteUser(prevState: any, formData: FormData) {
    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
        return { type: 'error', message: 'Firebase Admin SDK not initialized.' };
    }

    const validatedFields = deleteUserSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { type: 'error', message: 'Invalid data provided.' };
    }
    
    const { uid } = validatedFields.data;

    try {
        await adminAuth.deleteUser(uid);
        revalidatePath('/admin/users');
        return { type: 'success', message: 'User deleted successfully.' };
    } catch (error: any) {
        return { type: 'error', message: error.message };
    }
}
