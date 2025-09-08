
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { FoodItem } from '@/lib/data';

const adjustStockSchema = z.object({
  id: z.string(),
  adjustmentType: z.enum(['add', 'subtract'], { required_error: 'You must select an adjustment type.' }),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
});

type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

type StockAdjustmentFormProps = {
  foodItem: FoodItem;
  formAction: (payload: FormData) => void;
  isPending: boolean;
};

export function StockAdjustmentForm({ foodItem, formAction, isPending }: StockAdjustmentFormProps) {
  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      id: foodItem.id,
      adjustmentType: 'add',
      quantity: 1,
    },
  });

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" {...form.register('id')} />

        <div className="grid gap-2">
            <Label>Current Stock</Label>
            <Input value={`${foodItem.stock} ${foodItem.unit}`} disabled />
        </div>

        <FormField
          control={form.control}
          name="adjustmentType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Adjustment Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="add" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Add to Stock (Stock In)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="subtract" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Subtract from Stock (Stock Out)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Updating Stock...' : 'Update Stock'}
        </Button>
      </form>
    </Form>
  );
}
