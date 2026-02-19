import type { QuestionType } from './mathGenerator';

/** Achievement badge definition */
export interface Achievement {
    id: string;
    name: string;
    desc: string;
    /** Check if unlocked given current stats snapshot */
    check: (s: AchievementStats) => boolean;
}

/** Stats snapshot used for achievement checks */
export interface AchievementStats {
    totalXP: number;
    totalSolved: number;
    totalCorrect: number;
    bestStreak: number;
    dayStreak: number;
    sessionsPlayed: number;
    byType: Record<QuestionType, { solved: number; correct: number }>;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-steps',
        name: 'First Steps',
        desc: 'Solve your first problem',
        check: s => s.totalSolved >= 1,
    },
    {
        id: 'streak-5',
        name: 'On Fire',
        desc: 'Get a 5× streak',
        check: s => s.bestStreak >= 5,
    },
    {
        id: 'streak-20',
        name: 'Unstoppable',
        desc: 'Get a 20× streak',
        check: s => s.bestStreak >= 20,
    },
    {
        id: 'century',
        name: 'Century Club',
        desc: 'Solve 100 problems',
        check: s => s.totalSolved >= 100,
    },
    {
        id: 'math-machine',
        name: 'Math Machine',
        desc: 'Solve 500 problems',
        check: s => s.totalSolved >= 500,
    },
    {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        desc: '90%+ accuracy (50+ solved)',
        check: s => s.totalSolved >= 50 && (s.totalCorrect / s.totalSolved) >= 0.9,
    },
    {
        id: 'dedicated',
        name: 'Dedicated',
        desc: 'Play 7 days in a row',
        check: s => s.dayStreak >= 7,
    },
    {
        id: 'all-rounder',
        name: 'All-Rounder',
        desc: 'Solve 10+ of every type',
        check: s => {
            const META: string[] = ['daily', 'challenge', 'mix-basic', 'mix-all'];
            return Object.entries(s.byType)
                .filter(([k]) => !META.includes(k))
                .every(([, t]) => t.solved >= 10);
        },
    },
];

const STORAGE_KEY = 'math-swipe-achievements';

/** Load unlocked achievement IDs from localStorage */
export function loadUnlocked(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

/** Save unlocked achievement IDs */
export function saveUnlocked(ids: Set<string>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/** Check all achievements against stats, returns newly unlocked IDs */
export function checkAchievements(stats: AchievementStats, unlocked: Set<string>): string[] {
    const newlyUnlocked: string[] = [];
    for (const a of ACHIEVEMENTS) {
        if (!unlocked.has(a.id) && a.check(stats)) {
            newlyUnlocked.push(a.id);
        }
    }
    return newlyUnlocked;
}
