import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({
        message: 'Please enter valid email'
    }),
    password: z.string().min(2,{
        message: 'invalid password length'
    })
})

export type loginType = z.infer<typeof loginSchema>;