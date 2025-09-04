
'use client';

import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialSchools, type Learner } from '@/lib/data';


const learnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  gender: z.enum(['Male', 'Female']),
  className: z.string().min(1, 'Class is required'),
  guardian: z.string().min(1, 'Guardian is required'),
  district: z.string().min(1, 'District is required'),
  school: z.string().min(1, 'School is required'),
});

type LearnerFormValues = z.infer<typeof learnerSchema>;


type LearnerFormProps = {
  onSubmit: (data: any) => void;
  learner?: Learner;
};

const districts = [...new Set(initialSchools.map(school => school.district))];

export function LearnerForm({ onSubmit, learner }: LearnerFormProps) {
  const form = useForm<LearnerFormValues>({
    resolver: zodResolver(learnerSchema),
    defaultValues: learner || {
      name: '',
      dob: '',
      gender: 'Female',
      className: '',
      guardian: '',
      district: '',
      school: '',
    },
  });

  const selectedDistrict = useWatch({
    control: form.control,
    name: 'district',
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
        <div className="grid grid-cols-2 gap-4">
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
            name="gender"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDistrict}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {initialSchools
                    .filter(school => school.district === selectedDistrict)
                    .map(school => (
                      <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
