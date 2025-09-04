'use server';

import { getAdminAuth } from '@/lib/firebase/server';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createUser(prevState: any, formData: FormData) {
  const adminAuth = await getAdminAuth();
  if (!adminAuth) {
    return {
      type: 'error',
      message: 'Firebase Admin SDK is not initialized. Please check your service account credentials.',
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

    return {
      type: 'success',
      message: `User ${name} created successfully.`,
      user: JSON.stringify(userRecord),
    };
  } catch (error: any) {
    return {
      type: 'error',
      message: error.message,
    };
  }
}
