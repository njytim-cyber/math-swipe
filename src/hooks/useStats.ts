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
            bestStreak: s.bestStreak,
            totalSolved: s.totalSolved,
            accuracy,
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
    uidRef.current = uid;

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

    // Save to localStorage on every change + async Firestore sync
    useEffect(() => {
        saveStatsLocal(stats);
        if (uidRef.current) {
            saveStatsCloud(uidRef.current, stats);
        }
    }, [stats]);

    const recordSession = useCallback((
        score: number, correct: number, answered: number,
        bestStreak: number, questionType: QuestionType, hardMode = false, timedMode = false
    ) => {
        setStats(prev => {
            const prevType = prev.byType[questionType] || { ...EMPTY_TYPE };
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            let dayStreak = prev.dayStreak;
            if (prev.lastPlayedDate !== todayStr) {
                const yest = new Date(today);
                yest.setDate(yest.getDate() - 1);
                const yesterdayStr = `${yest.getFullYear()}-${yest.getMonth() + 1}-${yest.getDate()}`;
                dayStreak = prev.lastPlayedDate === yesterdayStr ? prev.dayStreak + 1 : 1;
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
