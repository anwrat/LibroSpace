import z from "zod";

export const registerSchema = z.object({
    body:z.object({
        name: z.string().min(3,"Name must be at least 3 characters").max(20,"Username cannot exceed 20 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string()
        .min(8,"Password must be at least 8 characters")
        .max(20,"Password cannot exceed 20 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        loginID: z.string().min(1,"Email or Username is required"),
        password: z.string().min(1,"Password is required"),
    }),
});