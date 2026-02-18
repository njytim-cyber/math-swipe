import { useState, useEffect, useCallback, useRef } from 'react';
import { generateProblem, type Problem } from '../utils/mathGenerator';
import { useDifficulty } from './useDifficulty';

export type ChalkState = 'idle' | 'success' | 'fail' | 'streak';
export type FeedbackFlash = 'none' | 'correct' | 'wrong';

const BUFFER_SIZE = 8;
const AUTO_ADVANCE_MS = 150;
const FAIL_PAUSE_MS = 800;

interface GameState {
    score: number;
    streak: number;
    bestStreak: number;
    totalCorrect: number;
    totalAnswered: number;
    chalkState: ChalkState;
    flash: FeedbackFlash;
    frozen: boolean;
}

const INITIAL_STATE: GameState = {
    score: 0, streak: 0, bestStreak: 0,
    totalCorrect: 0, totalAnswered: 0,
    chalkState: 'idle', flash: 'none', frozen: false,
};

export function useGameLoop() {
    const { level, recordAnswer } = useDifficulty();
    const [problems, setProblems] = useState<Problem[]>([]);
    // Single consolidated state object — ONE re-render per answer
    const [gs, setGs] = useState<GameState>(INITIAL_STATE);

    const chalkTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const startedRef = useRef(false);

    // ── Initialize buffer ──
    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        const initial = Array.from({ length: BUFFER_SIZE }, () => generateProblem(level));
        initial[0].startTime = Date.now();
        setProblems(initial);
    }, [level]);

    // ── Keep buffer full ──
    useEffect(() => {
        if (problems.length > 0 && problems.length < BUFFER_SIZE) {
            setProblems(prev => [...prev, generateProblem(level)]);
        }
    }, [problems.length, level]);

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

        // SKIP
        if (direction === 'up') {
            setGs(prev => ({ ...prev, streak: 0, chalkState: 'idle' }));
            advanceProblem();
            return;
        }

        // Map direction → option index
        const indexMap: Record<string, number> = { left: 0, down: 1, right: 2 };
        const selectedValue = current.options[indexMap[direction]];
        const correct = selectedValue === current.answer;

        recordAnswer(tts, correct);

        if (correct) {
            const newStreak = gs.streak + 1;
            setGs(prev => ({
                ...prev,
                streak: newStreak,
                bestStreak: Math.max(prev.bestStreak, newStreak),
                totalCorrect: prev.totalCorrect + 1,
                totalAnswered: prev.totalAnswered + 1,
                score: prev.score + 10 + Math.floor(newStreak / 5) * 5,
                flash: 'correct',
                chalkState: newStreak >= 10 ? 'streak' : 'success',
            }));
            scheduleChalkReset(newStreak >= 10 ? 2000 : 800);

            setTimeout(() => {
                setGs(prev => ({ ...prev, flash: 'none' }));
                advanceProblem();
            }, AUTO_ADVANCE_MS);
        } else {
            setGs(prev => ({
                ...prev,
                streak: 0,
                totalAnswered: prev.totalAnswered + 1,
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

    return {
        problems,
        ...gs,
        level,
        handleSwipe,
    };
}
