
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

const learnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  className: z.string().min(1, 'Class is required'),
  guardian: z.string().min(1, 'Guardian is required'),
});

type LearnerFormValues = z.infer<typeof learnerSchema>;

type Learner = {
  id: string;
  name: string;
  dob: string;
  className: string;
  guardian: string;
};

type LearnerFormProps = {
  onSubmit: (data: any) => void;
  learner?: Learner;
};

export function LearnerForm({ onSubmit, learner }: LearnerFormProps) {
  const form = useForm<LearnerFormValues>({
    resolver: zodResolver(learnerSchema),
    defaultValues: learner || {
      name: '',
      dob: '',
      className: '',
      guardian: '',
    },
  });

  const handleSubmit = (data: LearnerFormValues) => {
    if (learner) {
      onSubmit({ ...learner, ...data });
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="className"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Grade 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guardian"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guardian's Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {learner ? 'Update Learner' : 'Add Learner'}
        </Button>
      </form>
    </Form>
  );
}
