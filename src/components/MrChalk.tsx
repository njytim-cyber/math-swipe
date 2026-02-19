import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChalkState } from '../hooks/useGameLoop';
import type { QuestionType } from '../utils/questionTypes';
import { pickChalkMessage } from '../utils/chalkMessages';

const ANIMS: Record<ChalkState, object> = {
    idle: { y: [0, -6, 0], rotate: [0, 2, -2, 0], transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' as const } },
    success: { scale: [1, 1.25, 1], y: [0, -14, 0], transition: { duration: 0.45 } },
    fail: { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4 } },
    streak: { y: [0, -8, 0], scale: [1, 1.1, 1], rotate: [0, -3, 3, 0], transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' as const } },
};

// Static SVG parts extracted to avoid re-creating on every render
const Body = () => (
    <>
        <line x1="50" y1="64" x2="50" y2="110" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
        <line x1="50" y1="110" x2="36" y2="140" stroke="currentColor" strokeWidth="2" opacity="0.6" />
        <line x1="50" y1="110" x2="64" y2="140" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    </>
);

const ArmsUp = () => (
    <>
        <line x1="50" y1="78" x2="28" y2="64" stroke="currentColor" strokeWidth="2" opacity="0.6" />
        <line x1="50" y1="78" x2="72" y2="64" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    </>
);

const ArmsDown = () => (
    <>
        <line x1="50" y1="80" x2="30" y2="74" stroke="currentColor" strokeWidth="2" opacity="0.6" />
        <line x1="50" y1="80" x2="70" y2="74" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    </>
);

const FACES: Record<ChalkState, React.ReactNode> = {
    idle: (
        <>
            <circle cx="40" cy="34" r="2.5" fill="currentColor" opacity="0.8" />
            <circle cx="60" cy="34" r="2.5" fill="currentColor" opacity="0.8" />
            <path d="M 40 48 Q 50 55 60 48" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
        </>
    ),
    success: (
        <>
            <path d="M 36 34 Q 40 29 44 34" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 56 34 Q 60 29 64 34" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 38 48 Q 50 60 62 48" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <circle cx="34" cy="44" r="4" fill="currentColor" opacity="0.12" />
            <circle cx="66" cy="44" r="4" fill="currentColor" opacity="0.12" />
            <text x="74" y="30" fontSize="22">👍</text>
        </>
    ),
    fail: (
        <>
            <line x1="36" y1="30" x2="44" y2="38" stroke="currentColor" strokeWidth="2" />
            <line x1="44" y1="30" x2="36" y2="38" stroke="currentColor" strokeWidth="2" />
            <line x1="56" y1="30" x2="64" y2="38" stroke="currentColor" strokeWidth="2" />
            <line x1="64" y1="30" x2="56" y2="38" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
            <ellipse cx="70" cy="28" rx="2" ry="3.5" fill="currentColor" opacity="0.3" />
        </>
    ),
    streak: (
        <>
            <rect x="30" y="30" width="16" height="8" rx="3" fill="currentColor" opacity="0.9" />
            <rect x="54" y="30" width="16" height="8" rx="3" fill="currentColor" opacity="0.9" />
            <line x1="46" y1="34" x2="54" y2="34" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 42 50 Q 50 55 58 50" stroke="currentColor" strokeWidth="2" fill="none" />
            <text x="68" y="16" fontSize="20">🔥</text>
        </>
    ),
};
/** Costume accessories — extra SVG elements drawn on Mr. Chalk */
const COSTUMES: Record<string, React.ReactNode> = {
    'streak-5': ( // Fire aura
        <g opacity="0.5">
            <ellipse cx="50" cy="55" rx="32" ry="45" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 3" />
        </g>
    ),
    'streak-20': ( // Crown
        <g>
            <path d="M34 14L38 4l6 6 6-8 6 8 6-6 4 10z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
        </g>
    ),
    'sharpshooter': ( // Sunglasses
        <g>
            <rect x="33" y="30" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <rect x="55" y="30" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <line x1="45" y1="34" x2="55" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <line x1="33" y1="34" x2="28" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="67" y1="34" x2="72" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </g>
    ),
    'math-machine': ( // Wizard hat
        <g>
            <path d="M32 16L50 -4L68 16" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M30 16h40" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="50" cy="-2" r="2" fill="currentColor" opacity="0.5" />
        </g>
    ),
    'century': ( // Star above head
        <g>
            <path d="M50 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.4" />
        </g>
    ),
};

export const MrChalk = memo(function MrChalk({ state, costume, streak = 0, totalAnswered = 0, questionType = 'multiply', hardMode = false, timedMode = false }: {
    state: ChalkState;
    costume?: string;
    streak?: number;
    totalAnswered?: number;
    questionType?: QuestionType;
    hardMode?: boolean;
    timedMode?: boolean;
}) {
    const [message, setMessage] = useState('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const ctx = { state, streak, totalAnswered, questionType, hardMode, timedMode };

    useEffect(() => {
        setMessage(pickChalkMessage(ctx));
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setMessage(''), state === 'idle' ? 4000 : 2500);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    useEffect(() => {
        if (state !== 'idle') return;
        const interval = setInterval(() => setMessage(pickChalkMessage({ ...ctx, state: 'idle' })), 5000);
        return () => clearInterval(interval);

    }, [state]);

    return (
        <motion.div
            className={`absolute bottom-6 right-3 pointer-events-none z-30 ${state === 'streak' ? 'on-fire' : ''}`}
            animate={ANIMS[state] as any}
        >
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        key={message}
                        initial={{ opacity: 0, y: 8, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute bottom-full mb-2 right-0 max-w-[180px] text-right bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-[11px] ui text-white/80 leading-snug line-clamp-2 overflow-hidden"
                    >
                        {message}
                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white/10 border-b border-r border-white/15 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            <svg viewBox="0 0 100 160" className="w-[88px] h-[140px]" style={{ color: 'var(--color-chalk)' }}>
                <circle cx="50" cy="38" r="26" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />
                {FACES[state]}
                <Body />
                {state === 'success' ? <ArmsUp /> : <ArmsDown />}
                {costume && COSTUMES[costume]}
            </svg>
        </motion.div>
    );
});
