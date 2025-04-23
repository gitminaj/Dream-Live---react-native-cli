import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().max(10),
    dateOfBirth: z.string().transform((date)=> new Date(date) ),
    gender: z.enum([ 'Male', 'Female', 'Other' ]),
});

export type registerType = z.infer<typeof registerSchema>;