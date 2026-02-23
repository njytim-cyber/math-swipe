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
            const META: string[] = ['daily', 'challenge', 'mix-basic', 'mix-all', 'speedrun', 'ghost'];
            const validEntries = Object.entries(s.byType).filter(([k]) => !META.includes(k));

            // If they haven't even played out 10 distinct modes, they can't be an all rounder
            if (validEntries.length < 10) return false;

            return validEntries.every(([, t]) => t.solved >= 10);
        },
    },
];

/** Hard mode exclusive achievements — skull-themed 💀 */
export const HARD_MODE_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'skull-initiate',
        name: 'Skull Initiate',
        desc: 'Complete 1 hard mode session',
        check: s => s.hardModeSessions >= 1,
    },
    {
        id: 'skull-warrior',
        name: 'Skull Warrior',
        desc: 'Solve 50 on hard mode',
        check: s => s.hardModeSolved >= 50,
    },
    {
        id: 'skull-legend',
        name: 'Skull Legend',
        desc: 'Solve 200 on hard mode',
        check: s => s.hardModeSolved >= 200,
    },
    {
        id: 'skull-streak',
        name: 'Deathstreak',
        desc: '10× streak on hard mode',
        check: s => s.hardModeBestStreak >= 10,
    },
    {
        id: 'skull-sharp',
        name: 'Skull Sniper',
        desc: '90%+ accuracy on hard (30+)',
        check: s => s.hardModeSolved >= 30 && (s.hardModeCorrect / s.hardModeSolved) >= 0.9,
    },
    {
        id: 'skull-perfect',
        name: 'Flawless Victor',
        desc: 'Perfect hard mode session',
        check: s => s.hardModePerfects >= 1,
    },
];

/** All achievements combined */
export const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...HARD_MODE_ACHIEVEMENTS];

/** Timed mode achievements — stopwatch-themed ⏱️ */
export const TIMED_MODE_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'speed-demon',
        name: 'Speed Demon',
        desc: 'Complete 1 timed session',
        check: s => s.timedModeSessions >= 1,
    },
    {
        id: 'blitz-master',
        name: 'Blitz Master',
        desc: 'Solve 50 on timed mode',
        check: s => s.timedModeSolved >= 50,
    },
    {
        id: 'lightning',
        name: 'Lightning Reflexes',
        desc: '5× streak on timed mode',
        check: s => s.timedModeBestStreak >= 5,
    },
    {
        id: 'time-lord',
        name: 'Time Lord',
        desc: 'Perfect timed session',
        check: s => s.timedModePerfects >= 1,
    },
];

/** Ultimate mode achievements (hard + timed) — elite tier 💀⏱️ */
export const ULTIMATE_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'ultimate-ascend',
        name: 'Ascended',
        desc: 'Complete 1 ultimate session',
        check: s => s.ultimateSessions >= 1,
    },
    {
        id: 'ultimate-streak',
        name: 'Omega Streak',
        desc: '5× streak on ultimate',
        check: s => s.ultimateBestStreak >= 5,
    },
    {
        id: 'ultimate-perfect',
        name: 'Transcendence',
        desc: 'Perfect ultimate session',
        check: s => s.ultimatePerfects >= 1,
    },
];

/** Every achievement across all tiers */
export const EVERY_ACHIEVEMENT = [...ALL_ACHIEVEMENTS, ...TIMED_MODE_ACHIEVEMENTS, ...ULTIMATE_ACHIEVEMENTS];

const STORAGE_KEY = 'math-swipe-achievements';

/** Load unlocked achievement IDs from localStorage (sync fast path) */
export function loadUnlocked(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

/** Restore from Firestore if localStorage is empty */
export async function restoreUnlockedFromCloud(uid: string): Promise<Set<string> | null> {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists() && snap.data().achievements) {
            const cloudIds = new Set<string>(snap.data().achievements);
            // Merge with local
            const local = loadUnlocked();
            const merged = new Set([...local, ...cloudIds]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
            return merged;
        }
    } catch (err) {
        console.warn('Failed to restore achievements from cloud:', err);
    }
    return null;
}

/** Save unlocked achievement IDs — localStorage + Firestore */
export function saveUnlocked(ids: Set<string>, uid?: string | null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    if (uid) {
        // Async Firestore write (fire-and-forget)
        import('firebase/firestore').then(({ doc, setDoc }) => {
            import('./firebase').then(({ db }) => {
                setDoc(doc(db, 'users', uid), {
                    achievements: [...ids],
                    // Note: no updatedAt here to avoid rate-limit conflict with stats sync
                }, { merge: true }).catch(err => {
                    console.warn('Failed to sync achievements to cloud:', err);
                });
            });
        });
    }
}

/** Check all achievements against stats, returns newly unlocked IDs */
export function checkAchievements(stats: AchievementStats, unlocked: Set<string>): string[] {
    const newlyUnlocked: string[] = [];
    for (const a of EVERY_ACHIEVEMENT) {
        if (!unlocked.has(a.id) && a.check(stats)) {
            newlyUnlocked.push(a.id);
        }
    }
    return newlyUnlocked;
}
