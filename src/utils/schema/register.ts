import { number, z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3, { message: 'minimum three character name required' }),
    email: z.string().email(),
    phone: z.string().min(10).max(10, { message: 'number should be of 10 digit' }),
    dateOfBirth: z.string().min(1).transform((date)=> new Date(date) ),
    gender: z.enum([ 'Male', 'Female', 'Other' ]),
    password: z.string().min(6,{
        message: 'Minimum password length is 6'
    })
});

export type registerType = z.infer<typeof registerSchema>;