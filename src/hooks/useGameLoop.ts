import { useState, useEffect, useCallback, useRef } from 'react';
import { generateProblem, type Problem, type QuestionType } from '../utils/mathGenerator';
import { generateDailyChallenge } from '../utils/dailyChallenge';
import { useDifficulty } from './useDifficulty';

export type ChalkState = 'idle' | 'success' | 'fail' | 'streak';
export type FeedbackFlash = 'none' | 'correct' | 'wrong';

const MILESTONES: Record<number, string> = { 5: '🔥', 10: '⚡', 20: '👑', 50: '🏆' };

const BUFFER_SIZE = 8;
const AUTO_ADVANCE_MS = 150;
const FAIL_PAUSE_MS = 400;

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
}

const INITIAL_STATE: GameState = {
    score: 0, streak: 0, bestStreak: 0,
    totalCorrect: 0, totalAnswered: 0, answerHistory: [],
    chalkState: 'idle', flash: 'none', frozen: false,
    milestone: '', speedBonus: false,
};

export function useGameLoop(questionType: QuestionType = 'multiply', hardMode = false) {
    const { level, recordAnswer } = useDifficulty();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [gs, setGs] = useState<GameState>(INITIAL_STATE);

    const chalkTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const startedRef = useRef(false);
    const prevType = useRef(questionType);
    const prevHard = useRef(hardMode);

    const dailyRef = useRef<{ dateLabel: string } | null>(null);

    // ── Initialize buffer ──
    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        if (questionType === 'daily') {
            const { problems: dp, dateLabel } = generateDailyChallenge();
            dailyRef.current = { dateLabel };
            dp[0].startTime = Date.now();
            setProblems(dp);
        } else {
            dailyRef.current = null;
            const initial = Array.from({ length: BUFFER_SIZE }, () => generateProblem(level, questionType, hardMode));
            initial[0].startTime = Date.now();
            setProblems(initial);
        }
    }, [level, questionType]);

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
        } else {
            dailyRef.current = null;
            const fresh = Array.from({ length: BUFFER_SIZE }, () => generateProblem(level, questionType, hardMode));
            fresh[0].startTime = Date.now();
            setProblems(fresh);
        }
    }, [questionType, hardMode, level]);

    // ── Keep buffer full (not for daily/challenge — fixed set) ──
    useEffect(() => {
        if (questionType === 'daily' || questionType === 'challenge') return;
        if (problems.length > 0 && problems.length < BUFFER_SIZE) {
            setProblems(prev => [...prev, generateProblem(level, questionType, hardMode)]);
        }
    }, [problems.length, level, questionType]);

    // ── Advance to next problem ──
    const advanceProblem = useCallback(() => {
        setProblems(prev => {
            const next = prev.slice(1);
            if (next[0]) next[0].startTime = Date.now();
            return next;
        });
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

        recordAnswer(tts, correct);

        if (correct) {
            const newStreak = gs.streak + 1;
            const isFast = tts < 1200;
            const milestoneEmoji = MILESTONES[newStreak] || '';

            setGs(prev => ({
                ...prev,
                streak: newStreak,
                bestStreak: Math.max(prev.bestStreak, newStreak),
                totalCorrect: prev.totalCorrect + 1,
                totalAnswered: prev.totalAnswered + 1,
                answerHistory: [...prev.answerHistory, true],
                score: prev.score + 10 + Math.floor(newStreak / 5) * 5 + (isFast ? 2 : 0),
                flash: 'correct',
                chalkState: newStreak >= 10 ? 'streak' : 'success',
                milestone: milestoneEmoji,
                speedBonus: isFast,
            }));
            scheduleChalkReset(newStreak >= 10 ? 2000 : 800);

            // Auto-clear milestone after CSS animation
            if (milestoneEmoji) setTimeout(() => setGs(p => ({ ...p, milestone: '' })), 1300);
            if (isFast) setTimeout(() => setGs(p => ({ ...p, speedBonus: false })), 900);

            setTimeout(() => {
                setGs(prev => ({ ...prev, flash: 'none' }));
                advanceProblem();
            }, AUTO_ADVANCE_MS);
        } else {
            setGs(prev => ({
                ...prev,
                streak: 0,
                totalAnswered: prev.totalAnswered + 1,
                answerHistory: [...prev.answerHistory, false],
                flash: 'wrong',
                chalkState: 'fail',
                frozen: true,
            }));
            scheduleChalkReset(FAIL_PAUSE_MS);

            setTimeout(() => {
                setGs(prev => ({ ...prev, flash: 'none', frozen: false }));
                advanceProblem();
            }, FAIL_PAUSE_MS);
        }
    }, [gs.frozen, gs.streak, problems, recordAnswer, scheduleChalkReset, advanceProblem]);

    const dailyComplete = questionType === 'daily' && gs.totalAnswered > 0 && problems.length === 0;

    return {
        problems,
        ...gs,
        level,
        handleSwipe,
        dailyComplete,
        dailyDateLabel: dailyRef.current?.dateLabel || '',
    };
}
