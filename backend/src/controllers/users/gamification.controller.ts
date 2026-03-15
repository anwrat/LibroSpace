import type{ Request,Response } from "express";
import { getTotalReadingTimeToday } from "../../models/reading/reading_sessions.model.js";
import { getUserGoalandStreakInfo, increaseStreak, resetStreak, updateDailyGoal } from "../../models/auth/users.model.js";
import { insertDailyGoalAchievement, checkGoalMetYesterday } from "../../models/gamification/daily_goals_achieved.model.js";

export const getUserStreakandGoal = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const { daily_reading_goal, current_streak } = await getUserGoalandStreakInfo(userId);
        const today = new Date().toISOString().split('T')[0];
        if(!today){
            return res.status(400).json({message: "Bad request: Unable to determine today's date"});
        }
        const totalTimeRead = await getTotalReadingTimeToday(userId, today);
        return res.status(200).json({ data: {daily_reading_goal, current_streak }, timeToday: totalTimeRead });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const evaluateDailyGoal = async(req: Request, res: Response) =>{
    try{
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        if(!today){
            return res.status(400).json({message: "Bad request: Unable to determine today's date"});
        }
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const totalTimeRead = await getTotalReadingTimeToday(userId, today);
        const { daily_reading_goal, current_streak } = await getUserGoalandStreakInfo(userId);
        const dailyGoalInSeconds = daily_reading_goal * 60; // Convert minutes to seconds
        if(totalTimeRead >= dailyGoalInSeconds){
            // Record the achievement
            await insertDailyGoalAchievement(userId, today, totalTimeRead);
            // Increase streak
            const newStreak = await increaseStreak(userId);
            return res.status(200).json({ message: "Congratulations! You've achieved your daily reading goal!", totalTimeRead, newStreak });
        }else{
            return res.status(200).json({ message: "Keep going! You're making progress towards your daily reading goal.", totalTimeRead, current_streak });
        }
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const syncStreak = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if(!today || !yesterday){
            return res.status(400).json({message: "Bad request: Unable to determine today's or yesterday's date"});
        }

        // Check if user met the goal yesterday
        const goalMetYesterday = await checkGoalMetYesterday(userId, yesterday);
        
        // Check if user  met the goal today
        const goalMetToday = await checkGoalMetYesterday(userId, today); // Reusing same helper for today's date

        // Logic: Only reset if user missed BOTH yesterday AND today
        if (!goalMetYesterday && !goalMetToday) {
            const newStreak = await resetStreak(userId);
            return res.status(200).json({ 
                message: "Streak reset due to inactivity.", 
                current_streak: 0 
            });
        }

        // If we reach here, the streak is safe (either met yesterday, or already hit today)
        const userRes = await getUserGoalandStreakInfo(userId);
        
        return res.status(200).json({ 
            message: "Streak is intact.", 
            current_streak: userRes.current_streak,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const adjustDailyGoal = async(req: Request, res: Response)=>{
    try{
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {newGoal} = req.body;
        const updatedGoal = await updateDailyGoal(userId, newGoal);
        return res.status(200).json({ success: true, message: "Daily reading goal updated successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}