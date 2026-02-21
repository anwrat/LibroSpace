'use client';
import { useState, useEffect, useRef } from 'react';
import { updateSessionNotes } from '@/lib/user'; 

export function useReadingSession(sessionId: number, initialNotes: string) {
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState(initialNotes);
  const [isPaused, setIsPaused] = useState(false);
  const lastSavedNotes = useRef(initialNotes);

  // The Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // The Autosave Logic 
  useEffect(() => {
    const autosave = setInterval(async () => {
      if (notes !== lastSavedNotes.current && notes.length > 0) {
        try {
          await updateSessionNotes(sessionId, notes);
          lastSavedNotes.current = notes;
          console.log("Autosaved successfully");
        } catch (err) {
          console.error("Autosave failed", err);
        }
      }
    }, 30000); 

    return () => clearInterval(autosave);
  }, [notes, sessionId]);

  return { seconds, notes, setNotes, isPaused, setIsPaused };
}