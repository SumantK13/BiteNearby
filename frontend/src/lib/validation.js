import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
})