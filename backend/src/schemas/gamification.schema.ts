import {z} from "zod";

export const updateGoalSchema = z.object({
    body: z.object({
        newGoal: z.number().int().positive({message: "Daily reading goal must be a positive integer"})
    })
});

export const challengeFriendSchema = z.object({
    body: z.object({
        challengedId: z.number().int().positive({message: "Challenged user ID must be a positive integer"}),
        challengeType: z.enum(["pages", "time"], {message: "Challenge type must be either 'pages' or 'time'"}),
        goalValue: z.number().int().positive({message: "Goal value must be a positive integer"}),
        durationDays: z.number().int().positive({message: "Duration in days must be a positive integer"})
    })
});

export const respondToChallengeSchema = z.object({
    body: z.object({
        challengeId: z.number().int().positive({message: "Challenge ID must be a positive integer"}),
        action: z.enum(["accept", "decline"], {message: "Action must be either 'accept' or 'decline'"})
    })
});