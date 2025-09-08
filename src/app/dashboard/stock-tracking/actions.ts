
'use server';

import { z } from 'zod';
import { initialFoodItems, type FoodItem } from '@/lib/data';
import { revalidatePath } from 'next/cache';

// This is a mock database. In a real application, you would use a database.
let foodItems: FoodItem[] = [...initialFoodItems];


// --- Server Actions ---
export async function getFoodItems() {
  // In a real app, you'd fetch from a database
  return Promise.resolve(foodItems);
}


const adjustStockSchema = z.object({
  id: z.string(),
  adjustmentType: z.enum(['add', 'subtract']),
  quantity: z.coerce.number().min(1, 'Quantity must be greater than 0.'),
});


export async function adjustStock(prevState: any, formData: FormData) {
  const validatedFields = adjustStockSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check your entries.',
    };
  }

  const { id, adjustmentType, quantity } = validatedFields.data;

  const itemIndex = foodItems.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return { type: 'error', message: 'Food item not found.' };
  }

  const item = foodItems[itemIndex];
  let newStock = item.stock;

  if (adjustmentType === 'add') {
    newStock += quantity;
  } else {
    if (item.stock < quantity) {
        return { type: 'error', message: 'Cannot subtract more than the current stock.' };
    }
    newStock -= quantity;
  }

  try {
    foodItems[itemIndex] = { ...item, stock: newStock };
    revalidatePath('/dashboard/stock-tracking');
    return {
      type: 'success',
      message: `Stock for ${item.name} updated successfully.`,
    };
  } catch (error: any) {
    return {
      type: 'error',
      message: error.message,
    };
  }
}
