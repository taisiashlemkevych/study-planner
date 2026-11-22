import { z } from 'zod';

export const authSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z
    .string()
    .min(6, 'Password must contain at least 6 characters'),
});

export type LoginFormData = z.infer<typeof authSchema>;
