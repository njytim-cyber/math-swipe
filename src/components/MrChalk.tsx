import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChalkState } from '../hooks/useGameLoop';

const MESSAGES: Record<ChalkState, string[]> = {
    idle: [
        'You got this! 💪',
        'Take your time 🌟',
        'I believe in you!',
        'Math is beautiful ✨',
        'You\'re doing great!',
        'Focus mode: ON 🎯',
        'Ready when you are!',
        'Why was 6 afraid of 7? 🤔',
        'Let\'s gooo! 🚀',
    ],
    success: [
        'AMAZING! 🎉',
        'You\'re a genius! 🧠',
        'Nailed it! ✅',
        'Too easy for you! 😎',
        'Brilliant work! ⭐',
        'Math wizard! 🧙‍♂️',
        'Unstoppable! 🔥',
        'That was fast! ⚡',
        'Show off! 😄',
        'Big brain energy! 🧠✨',
        'Proud of you! 🥹',
    ],
    fail: [
        'Almost! Try again 💙',
        'You\'ll get it! 🌈',
        'Mistakes = learning! 📚',
        'Don\'t give up! 💪',
        'So close! 🤏',
        'Even Einstein made mistakes!',
        'Next one is yours! 🎯',
        'Shake it off! 💃',
    ],
    streak: [
        'ON FIRE! 🔥🔥🔥',
        'LEGENDARY! 👑',
        'Can\'t be stopped! 🚀',
        'Math machine! ⚙️',
        'Is this even hard? 😏',
        'They call you Calculator! 🧮',
        '7 ate 9... you ate this quiz!',
        'Streeeeak! 🎸',
        'You\'re CRACKED! 💥',
        'Hall of fame material! 🏆',
    ],
};

function pickRandom(arr: string[], lastRef: React.MutableRefObject<string>): string {
    const filtered = arr.filter(m => m !== lastRef.current);
    const pick = filtered[Math.floor(Math.random() * filtered.length)] || arr[0];
    lastRef.current = pick;
    return pick;
}

const anims: Record<ChalkState, object> = {
    idle: {
        y: [0, -6, 0],
        rotate: [0, 2, -2, 0],
        transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' as const },
    },
    success: {
        scale: [1, 1.25, 1],
        y: [0, -14, 0],
        transition: { duration: 0.45 },
    },
    fail: {
        x: [-6, 6, -6, 6, 0],
        transition: { duration: 0.4 },
    },
    streak: {
        y: [0, -8, 0],
        scale: [1, 1.1, 1],
        rotate: [0, -3, 3, 0],
        transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' as const },
    },
};

export function MrChalk({ state }: { state: ChalkState }) {
    const [message, setMessage] = useState('');
    const lastMsg = useRef('');
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    // Show a new message when state changes
    useEffect(() => {
        setMessage(pickRandom(MESSAGES[state], lastMsg));

        // Auto-hide after a delay
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setMessage(''), state === 'idle' ? 4000 : 2500);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [state]);

    // Cycle messages during idle
    useEffect(() => {
        if (state !== 'idle') return;
        const interval = setInterval(() => {
            setMessage(pickRandom(MESSAGES.idle, lastMsg));
        }, 5000);
        return () => clearInterval(interval);
    }, [state]);

    return (
        <motion.div
            className={`absolute bottom-6 right-3 pointer-events-none z-30 ${state === 'streak' ? 'on-fire' : ''}`}
            animate={anims[state]}
        >
            {/* Speech bubble */}
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        key={message}
                        initial={{ opacity: 0, y: 8, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute -top-12 right-0 whitespace-nowrap bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-1.5 text-[11px] font-[family-name:var(--font-ui)] text-white/80"
                    >
                        {message}
                        {/* Tail */}
                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white/10 border-b border-r border-white/15 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stick figure */}
            <svg
                viewBox="0 0 100 160"
                className="w-[88px] h-[140px]"
                style={{ color: 'var(--color-chalk)' }}
            >
                {/* Head */}
                <circle cx="50" cy="38" r="26" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Face */}
                {state === 'idle' && (
                    <>
                        <circle cx="40" cy="34" r="2.5" fill="currentColor" opacity="0.8" />
                        <circle cx="60" cy="34" r="2.5" fill="currentColor" opacity="0.8" />
                        <path d="M 40 48 Q 50 55 60 48" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
                    </>
                )}
                {state === 'success' && (
                    <>
                        <path d="M 36 34 Q 40 29 44 34" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M 56 34 Q 60 29 64 34" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M 38 48 Q 50 60 62 48" stroke="currentColor" strokeWidth="2.5" fill="none" />
                        <circle cx="34" cy="44" r="4" fill="currentColor" opacity="0.12" />
                        <circle cx="66" cy="44" r="4" fill="currentColor" opacity="0.12" />
                        <text x="74" y="30" fontSize="22">👍</text>
                    </>
                )}
                {state === 'fail' && (
                    <>
                        <line x1="36" y1="30" x2="44" y2="38" stroke="currentColor" strokeWidth="2" />
                        <line x1="44" y1="30" x2="36" y2="38" stroke="currentColor" strokeWidth="2" />
                        <line x1="56" y1="30" x2="64" y2="38" stroke="currentColor" strokeWidth="2" />
                        <line x1="64" y1="30" x2="56" y2="38" stroke="currentColor" strokeWidth="2" />
                        <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                        <ellipse cx="70" cy="28" rx="2" ry="3.5" fill="currentColor" opacity="0.3" />
                    </>
                )}
                {state === 'streak' && (
                    <>
                        <rect x="30" y="30" width="16" height="8" rx="3" fill="currentColor" opacity="0.9" />
                        <rect x="54" y="30" width="16" height="8" rx="3" fill="currentColor" opacity="0.9" />
                        <line x1="46" y1="34" x2="54" y2="34" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M 42 50 Q 50 55 58 50" stroke="currentColor" strokeWidth="2" fill="none" />
                        <text x="68" y="16" fontSize="20">🔥</text>
                    </>
                )}

                {/* Body */}
                <line x1="50" y1="64" x2="50" y2="110" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
                {/* Arms */}
                {state === 'success' ? (
                    <>
                        <line x1="50" y1="78" x2="28" y2="64" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                        <line x1="50" y1="78" x2="72" y2="64" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                    </>
                ) : (
                    <>
                        <line x1="50" y1="80" x2="30" y2="74" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                        <line x1="50" y1="80" x2="70" y2="74" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                    </>
                )}
                {/* Legs */}
                <line x1="50" y1="110" x2="36" y2="140" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                <line x1="50" y1="110" x2="64" y2="140" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            </svg>
        </motion.div>
    );
}
