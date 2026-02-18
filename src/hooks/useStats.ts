import { useState, useCallback, useEffect } from 'react';
import type { QuestionType } from '../utils/mathGenerator';

interface TypeStat {
    solved: number;
    correct: number;
}

interface Stats {
    totalXP: number;
    totalSolved: number;
    totalCorrect: number;
    bestStreak: number;
    sessionsPlayed: number;
    dayStreak: number;
    lastPlayedDate: string; // YYYY-MM-DD
    byType: Record<QuestionType, TypeStat>;
}

const STORAGE_KEY = 'math-swipe-stats';

const EMPTY_TYPE: TypeStat = { solved: 0, correct: 0 };

const EMPTY_STATS: Stats = {
    totalXP: 0,
    totalSolved: 0,
    totalCorrect: 0,
    bestStreak: 0,
    sessionsPlayed: 0,
    dayStreak: 0,
    lastPlayedDate: '',
    byType: {
        add: { ...EMPTY_TYPE },
        subtract: { ...EMPTY_TYPE },
        multiply: { ...EMPTY_TYPE },
        divide: { ...EMPTY_TYPE },
        square: { ...EMPTY_TYPE },
        sqrt: { ...EMPTY_TYPE },
    },
};

function loadStats(): Stats {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return EMPTY_STATS;
        const parsed = JSON.parse(raw);
        return {
            ...EMPTY_STATS,
            ...parsed,
            byType: { ...EMPTY_STATS.byType, ...parsed.byType },
        };
    } catch {
        return EMPTY_STATS;
    }
}

function saveStats(s: Stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useStats() {
    const [stats, setStats] = useState<Stats>(loadStats);

    useEffect(() => { saveStats(stats); }, [stats]);

    const recordSession = useCallback((
        score: number, correct: number, answered: number,
        bestStreak: number, questionType: QuestionType
    ) => {
        setStats(prev => {
            const prevType = prev.byType[questionType] || { ...EMPTY_TYPE };
            const today = new Date().toISOString().slice(0, 10);
            let dayStreak = prev.dayStreak;
            if (prev.lastPlayedDate !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                dayStreak = prev.lastPlayedDate === yesterday ? prev.dayStreak + 1 : 1;
            }
            return {
                totalXP: prev.totalXP + score,
                totalSolved: prev.totalSolved + answered,
                totalCorrect: prev.totalCorrect + correct,
                bestStreak: Math.max(prev.bestStreak, bestStreak),
                sessionsPlayed: prev.sessionsPlayed + 1,
                dayStreak,
                lastPlayedDate: today,
                byType: {
                    ...prev.byType,
                    [questionType]: {
                        solved: prevType.solved + answered,
                        correct: prevType.correct + correct,
                    },
                },
            };
        });
    }, []);

    const resetStats = useCallback(() => {
        setStats(EMPTY_STATS);
    }, []);

    const accuracy = stats.totalSolved > 0
        ? Math.round((stats.totalCorrect / stats.totalSolved) * 100)
        : 0;

    return { stats, accuracy, recordSession, resetStats };
}
