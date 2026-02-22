import { useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import type { QuestionType } from '../utils/mathGenerator';

interface TypeStat {
    solved: number;
    correct: number;
}

export interface Stats {
    totalXP: number;
    totalSolved: number;
    totalCorrect: number;
    bestStreak: number;
    sessionsPlayed: number;
    dayStreak: number;
    streakShields: number;
    lastPlayedDate: string; // YYYY-MM-DD
    byType: Record<QuestionType, TypeStat>;
    // Hard mode tracking
    hardModeSolved: number;
    hardModeCorrect: number;
    hardModeBestStreak: number;
    hardModeSessions: number;
    hardModePerfects: number;
    // Timed mode tracking
    timedModeSolved: number;
    timedModeCorrect: number;
    timedModeBestStreak: number;
    timedModeSessions: number;
    timedModePerfects: number;
    // Ultimate mode (hard + timed) tracking
    ultimateSolved: number;
    ultimateCorrect: number;
    ultimateBestStreak: number;
    ultimateSessions: number;
    ultimatePerfects: number;

    // Cosmetics for Leaderboard broadcast
    activeThemeId?: string;
    activeCostume?: string;
    activeTrailId?: string;
    activeBadgeId?: string; // Achievement badge shown on leaderboard

    // Speedrun tracking
    bestSpeedrunTime: number; // Stored in ms. 0 means unplayed.
    speedrunHardMode: boolean; // true if best speedrun was on hard mode
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
    streakShields: 0,
    lastPlayedDate: '',
    byType: {
        add: { ...EMPTY_TYPE },
        subtract: { ...EMPTY_TYPE },
        multiply: { ...EMPTY_TYPE },
        divide: { ...EMPTY_TYPE },
        square: { ...EMPTY_TYPE },
        sqrt: { ...EMPTY_TYPE },
        fraction: { ...EMPTY_TYPE },
        decimal: { ...EMPTY_TYPE },
        percent: { ...EMPTY_TYPE },
        linear: { ...EMPTY_TYPE },
        add1: { ...EMPTY_TYPE },
        sub1: { ...EMPTY_TYPE },
        bonds: { ...EMPTY_TYPE },
        doubles: { ...EMPTY_TYPE },
        compare: { ...EMPTY_TYPE },
        skip: { ...EMPTY_TYPE },
        round: { ...EMPTY_TYPE },
        orderops: { ...EMPTY_TYPE },
        exponent: { ...EMPTY_TYPE },
        negatives: { ...EMPTY_TYPE },
        gcflcm: { ...EMPTY_TYPE },
        ratio: { ...EMPTY_TYPE },
        'mix-basic': { ...EMPTY_TYPE },
        'mix-all': { ...EMPTY_TYPE },
        daily: { ...EMPTY_TYPE },
        challenge: { ...EMPTY_TYPE },
        speedrun: { ...EMPTY_TYPE },
        ghost: { ...EMPTY_TYPE },
    },
    hardModeSolved: 0,
    hardModeCorrect: 0,
    hardModeBestStreak: 0,
    hardModeSessions: 0,
    hardModePerfects: 0,
    timedModeSolved: 0,
    timedModeCorrect: 0,
    timedModeBestStreak: 0,
    timedModeSessions: 0,
    timedModePerfects: 0,
    ultimateSolved: 0,
    ultimateCorrect: 0,
    ultimateBestStreak: 0,
    ultimateSessions: 0,
    ultimatePerfects: 0,
    bestSpeedrunTime: 0,
    speedrunHardMode: false,
};

/** Load from localStorage (fast, synchronous) */
function loadStatsLocal(): Stats {
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

/** Save to localStorage (fast, synchronous) */
function saveStatsLocal(s: Stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/** Save to Firestore (async, background — includes leaderboard fields at top level) */
async function saveStatsCloud(uid: string, s: Stats) {
    try {
        const accuracy = s.totalSolved > 0 ? Math.round((s.totalCorrect / s.totalSolved) * 100) : 0;
        await setDoc(doc(db, 'users', uid), {
            // Top-level leaderboard-queryable fields
            totalXP: s.totalXP,
            bestStreak: Math.max(s.bestStreak || 0, s.hardModeBestStreak || 0, s.timedModeBestStreak || 0, s.ultimateBestStreak || 0),
            totalSolved: s.totalSolved,
            accuracy,
            activeThemeId: s.activeThemeId || 'classic',
            activeCostume: s.activeCostume || '',
            activeTrailId: s.activeTrailId || '',
            activeBadgeId: s.activeBadgeId || '',
            bestSpeedrunTime: s.bestSpeedrunTime || 0,
            streakShields: s.streakShields || 0,
            // Full stats blob
            stats: s,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.warn('Failed to sync stats to cloud:', err);
    }
}

/** Load from Firestore (async fallback) */
async function loadStatsCloud(uid: string): Promise<Stats | null> {
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists() && snap.data().stats) {
            const cloud = snap.data().stats;
            return {
                ...EMPTY_STATS,
                ...cloud,
                byType: { ...EMPTY_STATS.byType, ...cloud.byType },
            };
        }
    } catch (err) {
        console.warn('Failed to load stats from cloud:', err);
    }
    return null;
}

/** Pick the "better" stats — whoever has more XP wins (most recent progress) */
function mergeStats(local: Stats, cloud: Stats): Stats {
    if (cloud.totalXP > local.totalXP) return cloud;
    return local;
}

export function useStats(uid: string | null) {
    const [stats, setStats] = useState<Stats>(loadStatsLocal);
    const uidRef = useRef(uid);
    useEffect(() => {
        uidRef.current = uid;
    }, [uid]);

    // Phase 2: On mount, try to restore from Firestore if localStorage is stale
    useEffect(() => {
        if (!uid) return;
        loadStatsCloud(uid).then(cloud => {
            if (!cloud) return;
            setStats(prev => {
                const merged = mergeStats(prev, cloud);
                saveStatsLocal(merged); // update local cache
                return merged;
            });
        });
    }, [uid]);

    // Save to localStorage on every change + debounced Firestore sync
    const cloudTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
        saveStatsLocal(stats);
        if (uidRef.current) {
            // Debounce Firestore writes to reduce costs during rapid gameplay
            clearTimeout(cloudTimerRef.current);
            cloudTimerRef.current = setTimeout(() => {
                if (uidRef.current) saveStatsCloud(uidRef.current, stats);
            }, 2000);
        }
    }, [stats]);

    const updateCosmetics = useCallback((themeId: string, costumeId: string, trailId: string) => {
        setStats(prev => ({
            ...prev,
            activeThemeId: themeId,
            activeCostume: costumeId,
            activeTrailId: trailId,
        }));
    }, []);

    const recordSession = useCallback((
        score: number, correct: number, answered: number,
        bestStreak: number, questionType: QuestionType, hardMode = false, timedMode = false
    ) => {
        setStats(prev => {
            const prevType = prev.byType[questionType] || { ...EMPTY_TYPE };
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            let dayStreak = prev.dayStreak;
            let streakShields = prev.streakShields || 0;

            if (prev.lastPlayedDate !== todayStr) {
                const yest = new Date(today);
                yest.setDate(yest.getDate() - 1);
                const yesterdayStr = `${yest.getFullYear()}-${yest.getMonth() + 1}-${yest.getDate()}`;

                if (prev.lastPlayedDate === yesterdayStr) {
                    dayStreak = prev.dayStreak + 1;
                    if (dayStreak % 7 === 0) {
                        streakShields = Math.min(3, streakShields + 1);
                    }
                } else if (prev.lastPlayedDate !== '') {
                    // Missed one or more days (and not very first session ever)
                    if (streakShields > 0) {
                        streakShields -= 1;
                        dayStreak = prev.dayStreak + 1; // Shield consumed! Forgive and extend.
                        if (dayStreak % 7 === 0) {
                            streakShields = Math.min(3, streakShields + 1);
                        }
                    } else {
                        dayStreak = 1; // Streak broken
                    }
                } else {
                    dayStreak = 1; // First session ever
                }
            }
            const isPerfect = answered > 0 && correct === answered;
            const isUltimate = hardMode && timedMode;
            return {
                totalXP: prev.totalXP + score,
                totalSolved: prev.totalSolved + answered,
                totalCorrect: prev.totalCorrect + correct,
                bestStreak: Math.max(prev.bestStreak, bestStreak),
                sessionsPlayed: prev.sessionsPlayed + 1,
                dayStreak,
                streakShields,
                lastPlayedDate: todayStr,
                byType: {
                    ...prev.byType,
                    [questionType]: {
                        solved: prevType.solved + answered,
                        correct: prevType.correct + correct,
                    },
                },
                // Hard mode stats
                hardModeSolved: prev.hardModeSolved + (hardMode ? answered : 0),
                hardModeCorrect: prev.hardModeCorrect + (hardMode ? correct : 0),
                hardModeBestStreak: hardMode ? Math.max(prev.hardModeBestStreak, bestStreak) : prev.hardModeBestStreak,
                hardModeSessions: prev.hardModeSessions + (hardMode ? 1 : 0),
                hardModePerfects: prev.hardModePerfects + (hardMode && isPerfect ? 1 : 0),
                // Timed mode stats
                timedModeSolved: prev.timedModeSolved + (timedMode ? answered : 0),
                timedModeCorrect: prev.timedModeCorrect + (timedMode ? correct : 0),
                timedModeBestStreak: timedMode ? Math.max(prev.timedModeBestStreak, bestStreak) : prev.timedModeBestStreak,
                timedModeSessions: prev.timedModeSessions + (timedMode ? 1 : 0),
                timedModePerfects: prev.timedModePerfects + (timedMode && isPerfect ? 1 : 0),
                // Ultimate mode stats (hard + timed)
                ultimateSolved: prev.ultimateSolved + (isUltimate ? answered : 0),
                ultimateCorrect: prev.ultimateCorrect + (isUltimate ? correct : 0),
                ultimateBestStreak: isUltimate ? Math.max(prev.ultimateBestStreak, bestStreak) : prev.ultimateBestStreak,
                ultimateSessions: prev.ultimateSessions + (isUltimate ? 1 : 0),
                ultimatePerfects: prev.ultimatePerfects + (isUltimate && isPerfect ? 1 : 0),
                bestSpeedrunTime: prev.bestSpeedrunTime,
                speedrunHardMode: prev.speedrunHardMode,
            };
        });
    }, []);

    const resetStats = useCallback(() => {
        setStats(EMPTY_STATS);
    }, []);

    const updateBestSpeedrunTime = useCallback((timeMs: number, hardMode = false) => {
        setStats(prev => {
            if (prev.bestSpeedrunTime > 0 && timeMs >= prev.bestSpeedrunTime) return prev;
            return { ...prev, bestSpeedrunTime: timeMs, speedrunHardMode: hardMode };
        });
    }, []);

    const updateBadge = useCallback((badgeId: string) => {
        setStats(prev => ({ ...prev, activeBadgeId: badgeId }));
    }, []);

    const consumeShield = useCallback(() => {
        setStats(prev => ({
            ...prev,
            streakShields: Math.max(0, prev.streakShields - 1),
        }));
    }, []);

    const accuracy = stats.totalSolved > 0
        ? Math.round((stats.totalCorrect / stats.totalSolved) * 100)
        : 0;

    return { stats, accuracy, recordSession, resetStats, updateCosmetics, updateBestSpeedrunTime, updateBadge, consumeShield };
}
