import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim(),
  category: z.string().trim().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']),
});

export type TaskFormData = z.infer<typeof taskSchema>;
