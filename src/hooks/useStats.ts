import { useState, useCallback, useEffect } from 'react';

interface Stats {
    totalXP: number;
    totalSolved: number;
    totalCorrect: number;
    bestStreak: number;
    sessionsPlayed: number;
}

const STORAGE_KEY = 'math-swipe-stats';

const EMPTY_STATS: Stats = {
    totalXP: 0,
    totalSolved: 0,
    totalCorrect: 0,
    bestStreak: 0,
    sessionsPlayed: 0,
};

function loadStats(): Stats {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return EMPTY_STATS;
        return { ...EMPTY_STATS, ...JSON.parse(raw) };
    } catch {
        return EMPTY_STATS;
    }
}

function saveStats(s: Stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useStats() {
    const [stats, setStats] = useState<Stats>(loadStats);

    // Persist whenever stats change
    useEffect(() => { saveStats(stats); }, [stats]);

    const recordSession = useCallback((score: number, correct: number, answered: number, bestStreak: number) => {
        setStats(prev => ({
            totalXP: prev.totalXP + score,
            totalSolved: prev.totalSolved + answered,
            totalCorrect: prev.totalCorrect + correct,
            bestStreak: Math.max(prev.bestStreak, bestStreak),
            sessionsPlayed: prev.sessionsPlayed + 1,
        }));
    }, []);

    const accuracy = stats.totalSolved > 0
        ? Math.round((stats.totalCorrect / stats.totalSolved) * 100)
        : 0;

    return { stats, accuracy, recordSession };
}
