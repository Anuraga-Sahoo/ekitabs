
"use client";

import { useState, useEffect, useCallback } from 'react';

export function useTestTimer(initialMinutes: number, onTimerEnd?: () => void) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (totalSeconds === 0 && isActive) {
      setIsActive(false);
      onTimerEnd?.();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSeconds, onTimerEnd]);

  const startTimer = useCallback(() => {
    setTotalSeconds(initialMinutes * 60); // Reset timer if started again
    setIsActive(true);
  }, [initialMinutes]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTotalSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    minutes,
    seconds,
    isActive,
    startTimer,
    stopTimer,
    resetTimer,
    totalSecondsLeft: totalSeconds,
  };
}
