import { z } from 'zod';

export const agencyRegisterSchema = z.object({
  name: z.string().min(3, { message: 'Minimum three character name required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  number: z
    .string()
    .length(10, { message: 'Number should be exactly 10 digits' })
    .regex(/^\d+$/, { message: 'Number must contain digits only' }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    message: 'Gender must be Male, Female, or Other',
  }),
  idProofName: z.enum(['Government Id', 'Aadhar', 'Voter Id', 'PAN Card'], {
    message: 'ID Proof must be one of the allowed types',
  }),
  accountNumber: z
    .string()
    .min(9, { message: 'Account number must be at least 9 digits' })
    .max(18, { message: 'Account number must be at most 18 digits' }),
  IFSC: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
      message: 'Invalid IFSC code format',
    }),
});

