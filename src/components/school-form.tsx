
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

const schoolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  district: z.string().min(1, 'District is required'),
  learners: z.coerce.number().min(0, 'Number of learners is required'),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

type School = {
  id: string;
  name: string;
  district: string;
  learners: number;
};

type SchoolFormProps = {
  onSubmit: (data: any) => void;
  school?: School;
};

export function SchoolForm({ onSubmit, school }: SchoolFormProps) {
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: school || {
      name: '',
      district: '',
      learners: 0,
    },
  });

  const handleSubmit = (data: SchoolFormValues) => {
    if (school) {
      onSubmit({ ...school, ...data });
    } else {
      onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Dotito Primary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Mt Darwin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="learners"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Learners</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {school ? 'Update School' : 'Add School'}
        </Button>
      </form>
    </Form>
  );
}
