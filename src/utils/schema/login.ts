import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({
        message: 'invalid email'
    }),
    password: z.string().min(6,{
        message: 'invalid password length'
    })
})

export type loginType = z.infer<typeof loginSchema>;