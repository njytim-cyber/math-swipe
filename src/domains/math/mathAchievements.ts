/**
 * domains/math/mathAchievements.ts
 *
 * Math-specific achievement definitions and stats snapshot type.
 * Moved from src/utils/achievements.ts — keeps subject logic in the domain.
 */
import type { Achievement } from '../../utils/achievements';
import type { QuestionType } from './mathCategories';

// ── Stats snapshot ────────────────────────────────────────────────────────────

/** Stats snapshot used for math achievement checks */
export interface MathAchievementStats {
    totalXP: number;
    totalSolved: number;
    totalCorrect: number;
    bestStreak: number;
    dayStreak: number;
    sessionsPlayed: number;
    byType: Record<QuestionType, { solved: number; correct: number }>;
    // Hard mode
    hardModeSolved: number;
    hardModeCorrect: number;
    hardModeBestStreak: number;
    hardModeSessions: number;
    hardModePerfects: number;
    // Timed mode
    timedModeSolved: number;
    timedModeCorrect: number;
    timedModeBestStreak: number;
    timedModeSessions: number;
    timedModePerfects: number;
    // Ultimate (hard + timed)
    ultimateSolved: number;
    ultimateCorrect: number;
    ultimateBestStreak: number;
    ultimateSessions: number;
    ultimatePerfects: number;
}

// ── Achievement lists ─────────────────────────────────────────────────────────

const CORE_ACHIEVEMENTS: Achievement<MathAchievementStats>[] = [
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
            const META: string[] = ['daily', 'challenge', 'mix-basic', 'mix-all', 'speedrun', 'ghost'];
            const validEntries = Object.entries(s.byType).filter(([k]) => !META.includes(k));
            if (validEntries.length < 10) return false;
            return validEntries.every(([, t]) => t.solved >= 10);
        },
    },
];

const HARD_MODE_ACHIEVEMENTS: Achievement<MathAchievementStats>[] = [
    { id: 'skull-initiate', name: 'Skull Initiate', desc: 'Complete 1 hard mode session', check: s => s.hardModeSessions >= 1 },
    { id: 'skull-warrior', name: 'Skull Warrior', desc: 'Solve 50 on hard mode', check: s => s.hardModeSolved >= 50 },
    { id: 'skull-legend', name: 'Skull Legend', desc: 'Solve 200 on hard mode', check: s => s.hardModeSolved >= 200 },
    { id: 'skull-streak', name: 'Deathstreak', desc: '10× streak on hard mode', check: s => s.hardModeBestStreak >= 10 },
    { id: 'skull-sharp', name: 'Skull Sniper', desc: '90%+ accuracy on hard (30+)', check: s => s.hardModeSolved >= 30 && (s.hardModeCorrect / s.hardModeSolved) >= 0.9 },
    { id: 'skull-perfect', name: 'Flawless Victor', desc: 'Perfect hard mode session', check: s => s.hardModePerfects >= 1 },
];

const TIMED_MODE_ACHIEVEMENTS: Achievement<MathAchievementStats>[] = [
    { id: 'speed-demon', name: 'Speed Demon', desc: 'Complete 1 timed session', check: s => s.timedModeSessions >= 1 },
    { id: 'blitz-master', name: 'Blitz Master', desc: 'Solve 50 on timed mode', check: s => s.timedModeSolved >= 50 },
    { id: 'lightning', name: 'Lightning Reflexes', desc: '5× streak on timed mode', check: s => s.timedModeBestStreak >= 5 },
    { id: 'time-lord', name: 'Time Lord', desc: 'Perfect timed session', check: s => s.timedModePerfects >= 1 },
];

const ULTIMATE_ACHIEVEMENTS: Achievement<MathAchievementStats>[] = [
    { id: 'ultimate-ascend', name: 'Ascended', desc: 'Complete 1 ultimate session', check: s => s.ultimateSessions >= 1 },
    { id: 'ultimate-streak', name: 'Omega Streak', desc: '5× streak on ultimate', check: s => s.ultimateBestStreak >= 5 },
    { id: 'ultimate-perfect', name: 'Transcendence', desc: 'Perfect ultimate session', check: s => s.ultimatePerfects >= 1 },
];

/** All math achievements across every tier — single source of truth */
export const EVERY_MATH_ACHIEVEMENT: Achievement<MathAchievementStats>[] = [
    ...CORE_ACHIEVEMENTS,
    ...HARD_MODE_ACHIEVEMENTS,
    ...TIMED_MODE_ACHIEVEMENTS,
    ...ULTIMATE_ACHIEVEMENTS,
];
