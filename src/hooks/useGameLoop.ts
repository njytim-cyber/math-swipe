import { useState, useEffect, useCallback, useRef } from 'react';
import { generateProblem, type Problem, type QuestionType } from '../utils/mathGenerator';
import { generateDailyChallenge, generateChallenge } from '../utils/dailyChallenge';
import { useDifficulty } from './useDifficulty';

export type ChalkState = 'idle' | 'success' | 'fail' | 'streak' | 'comeback';
export type FeedbackFlash = 'none' | 'correct' | 'wrong';

const MILESTONES: Record<number, string> = { 5: '🔥', 10: '⚡', 20: '👑', 50: '🏆' };

const BUFFER_SIZE = 8;
const AUTO_ADVANCE_MS = 150;
const FAIL_PAUSE_MS = 400;
const TIMED_MODE_MS = 10_000;
const MAX_HISTORY = 50;

interface GameState {
    score: number;
    streak: number;
    bestStreak: number;
    totalCorrect: number;
    totalAnswered: number;
    answerHistory: boolean[];
    chalkState: ChalkState;
    flash: FeedbackFlash;
    frozen: boolean;
    milestone: string;    // emoji or '' — shown via CSS animation
    speedBonus: boolean;  // true for ~0.8s after fast answer
    wrongStreak: number;  // consecutive wrong answers (for comeback detection)
}

const INITIAL_STATE: GameState = {
    score: 0, streak: 0, bestStreak: 0,
    totalCorrect: 0, totalAnswered: 0, answerHistory: [],
    chalkState: 'idle', flash: 'none', frozen: false,
    milestone: '', speedBonus: false, wrongStreak: 0,
};

/** Shared wrong-answer state transform (avoids 3x duplication) */
function wrongAnswerState(prev: GameState): GameState {
    return {
        ...prev,
        streak: 0,
        totalAnswered: prev.totalAnswered + 1,
        answerHistory: [...prev.answerHistory, false].slice(-MAX_HISTORY),
        flash: 'wrong',
        chalkState: 'fail',
        frozen: true,
        wrongStreak: prev.wrongStreak + 1,
    };
}

export function useGameLoop(questionType: QuestionType = 'multiply', hardMode = false, challengeId: string | null = null, timedMode = false) {
    const { level, recordAnswer } = useDifficulty();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [gs, setGs] = useState<GameState>(INITIAL_STATE);

    const chalkTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const startedRef = useRef(false);
    const prevType = useRef(questionType);
    const prevHard = useRef(hardMode);

    const dailyRef = useRef<{ dateLabel: string } | null>(null);
    const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    /** Schedule a timeout that gets auto-cleared on unmount */
    const safeTimeout = useCallback((fn: () => void, ms: number) => {
        const id = setTimeout(() => {
            pendingTimers.current = pendingTimers.current.filter(t => t !== id);
            fn();
        }, ms);
        pendingTimers.current.push(id);
        return id;
    }, []);

    // ── Timed mode ──
    const [timerProgress, setTimerProgress] = useState(0); // 0 → 1
    const timerStartRef = useRef<number>(0);
    const timerRafRef = useRef<number>(0);
    const timedModeRef = useRef(timedMode);
    timedModeRef.current = timedMode;

    // ── Initialize buffer ──
    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        if (questionType === 'daily') {
            const { problems: dp, dateLabel } = generateDailyChallenge();
            dailyRef.current = { dateLabel };
            dp[0].startTime = Date.now();
            setProblems(dp);
        } else if (questionType === 'challenge' && challengeId) {
            const cp = generateChallenge(challengeId);
            cp[0].startTime = Date.now();
            setProblems(cp);
        } else {
            dailyRef.current = null;
            const initial = Array.from({ length: BUFFER_SIZE }, () => generateProblem(level, questionType, hardMode));
            initial[0].startTime = Date.now();
            setProblems(initial);
        }
    }, [level, questionType, challengeId, hardMode]);

    // ── Regenerate on question type change ──
    useEffect(() => {
        if (prevType.current === questionType && prevHard.current === hardMode) return;
        prevType.current = questionType;
        prevHard.current = hardMode;
        if (questionType === 'daily') {
            const { problems: dp, dateLabel } = generateDailyChallenge();
            dailyRef.current = { dateLabel };
            dp[0].startTime = Date.now();
            setProblems(dp);
            setGs(INITIAL_STATE);
        } else if (questionType === 'challenge' && challengeId) {
            const cp = generateChallenge(challengeId);
            cp[0].startTime = Date.now();
            setProblems(cp);
            setGs(INITIAL_STATE);
        } else {
            dailyRef.current = null;
            const fresh = Array.from({ length: BUFFER_SIZE }, () => generateProblem(level, questionType, hardMode));
            fresh[0].startTime = Date.now();
            setProblems(fresh);
        }
    }, [questionType, hardMode, level, challengeId]);

    // ── Keep buffer full (not for daily/challenge — fixed set) ──
    useEffect(() => {
        if (questionType === 'daily' || questionType === 'challenge') return;
        if (problems.length < BUFFER_SIZE) {
            setProblems(prev => [...prev, generateProblem(level, questionType, hardMode)]);
        }
    }, [problems.length, level, questionType, hardMode]);

    // ── Advance to next problem ──
    const advanceProblem = useCallback(() => {
        setProblems(prev => {
            const next = prev.slice(1);
            if (next[0]) next[0].startTime = Date.now();
            return next;
        });
        // Reset timer for next question
        if (timedModeRef.current) {
            timerStartRef.current = Date.now();
            setTimerProgress(0);
        }
    }, []);

    // ── Reset chalk state after delay ──
    const scheduleChalkReset = useCallback((durationMs: number) => {
        if (chalkTimerRef.current) clearTimeout(chalkTimerRef.current);
        chalkTimerRef.current = setTimeout(() => {
            setGs(prev => ({ ...prev, chalkState: prev.chalkState === 'streak' ? 'streak' : 'idle' }));
        }, durationMs);
    }, []);

    // ── Handle answer ──
    const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
        if (gs.frozen || problems.length === 0) return;

        const current = problems[0];
        const tts = Date.now() - (current.startTime || Date.now());

        if (direction === 'up') {
            setGs(prev => ({ ...prev, streak: 0, chalkState: 'idle' }));
            advanceProblem();
            return;
        }

        const indexMap: Record<string, number> = { left: 0, down: 1, right: 2 };
        const selectedValue = current.options[indexMap[direction]];
        const correct = selectedValue === current.answer;

        if (correct) {
            recordAnswer(tts, correct);
            const newStreak = gs.streak + 1;
            const isFast = tts < 1200;
            const milestoneEmoji = MILESTONES[newStreak] || '';

            setGs(prev => ({
                ...prev,
                streak: newStreak,
                bestStreak: Math.max(prev.bestStreak, newStreak),
                totalCorrect: prev.totalCorrect + 1,
                totalAnswered: prev.totalAnswered + 1,
                answerHistory: [...prev.answerHistory, true].slice(-MAX_HISTORY),
                score: prev.score + 10 + Math.floor(newStreak / 5) * 5 + (isFast ? 2 : 0),
                flash: 'correct',
                chalkState: newStreak >= 10 ? 'streak' : (prev.wrongStreak >= 3 ? 'comeback' as ChalkState : 'success'),
                milestone: milestoneEmoji,
                speedBonus: isFast,
                wrongStreak: 0,
                frozen: true, // Freeze immediately to prevent queued multi-taps
            }));
            scheduleChalkReset(newStreak >= 10 ? 2000 : 800);

            // Auto-clear milestone after CSS animation
            if (milestoneEmoji) safeTimeout(() => setGs(p => ({ ...p, milestone: '' })), 1300);
            if (isFast) safeTimeout(() => setGs(p => ({ ...p, speedBonus: false })), 900);

            safeTimeout(() => {
                setGs(prev => ({ ...prev, flash: 'none', frozen: false }));
                advanceProblem();
            }, AUTO_ADVANCE_MS);
        } else {
            // During tutorial (first question) — don't count as wrong, just shake and let them retry
            const isTutorial = gs.totalAnswered === 0;

            if (isTutorial) {
                setGs(prev => ({
                    ...prev,
                    flash: 'wrong',
                    chalkState: 'fail',
                    frozen: true,
                }));
                scheduleChalkReset(FAIL_PAUSE_MS);
                safeTimeout(() => {
                    setGs(prev => ({ ...prev, flash: 'none', frozen: false }));
                }, FAIL_PAUSE_MS);
            } else {
                recordAnswer(tts, false);
                setGs(wrongAnswerState);
                scheduleChalkReset(FAIL_PAUSE_MS);

                safeTimeout(() => {
                    setGs(prev => ({ ...prev, flash: 'none', frozen: false }));
                    advanceProblem();
                }, FAIL_PAUSE_MS);
            }
        }
    }, [gs.frozen, gs.streak, gs.totalAnswered, problems, recordAnswer, scheduleChalkReset, advanceProblem, safeTimeout]);

    // ── Timed mode tick + auto-skip ──
    useEffect(() => {
        if (!timedMode || gs.frozen || problems.length === 0) {
            cancelAnimationFrame(timerRafRef.current);
            if (!timedMode) setTimerProgress(0);
            return;
        }
        timerStartRef.current = Date.now();
        setTimerProgress(0);

        const tick = () => {
            const elapsed = Date.now() - timerStartRef.current;
            const p = Math.min(elapsed / TIMED_MODE_MS, 1);
            setTimerProgress(p);
            if (p >= 1) {
                // Time's up — skip and break streak
                setGs(wrongAnswerState);
                scheduleChalkReset(FAIL_PAUSE_MS);
                safeTimeout(() => {
                    setGs(prev => ({ ...prev, flash: 'none', frozen: false }));
                    advanceProblem();
                }, FAIL_PAUSE_MS);
                return;
            }
            timerRafRef.current = requestAnimationFrame(tick);
        };
        timerRafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(timerRafRef.current);
        // Reset when problem changes (problems[0] identity)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timedMode, problems[0]?.id, gs.frozen]);

    const dailyComplete = (questionType === 'daily' || questionType === 'challenge') && gs.totalAnswered > 0 && problems.length === 0;

    // ── Cleanup all timers on unmount (#4, #11) ──
    useEffect(() => {
        return () => {
            if (chalkTimerRef.current) clearTimeout(chalkTimerRef.current);
            pendingTimers.current.forEach(t => clearTimeout(t));
            pendingTimers.current = [];
        };
    }, []);

    return {
        problems,
        ...gs,
        level,
        handleSwipe,
        timerProgress,
        dailyComplete,
        dailyDateLabel: dailyRef.current?.dateLabel || '',
    };
}
