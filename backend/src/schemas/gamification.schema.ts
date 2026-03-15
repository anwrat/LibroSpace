import {z} from "zod";

export const updateGoalSchema = z.object({
    body: z.object({
        newGoal: z.number().int().positive({message: "Daily reading goal must be a positive integer"})
    })
});