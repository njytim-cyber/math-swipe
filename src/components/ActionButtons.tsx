import { memo } from 'react';
import { motion } from 'framer-motion';
import { QuestionTypePicker } from './QuestionTypePicker';
import type { QuestionType } from '../utils/mathGenerator';

interface Props {
    questionType: QuestionType;
    onTypeChange: (type: QuestionType) => void;
    hardMode: boolean;
    onHardModeToggle: () => void;
    timedMode: boolean;
    onTimedModeToggle: () => void;
    timerProgress: number; // 0 → 1
}

/** Circular countdown ring drawn as an SVG arc */
function TimerRing({ progress, active }: { progress: number; active: boolean }) {
    const r = 19;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - progress);

    return (
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
            {/* Track */}
            <circle
                cx="22" cy="22" r={r}
                fill="none"
                stroke={active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.15)'}
                strokeWidth="2.5"
            />
            {/* Progress arc */}
            {active && (
                <circle
                    cx="22" cy="22" r={r}
                    fill="none"
                    stroke={progress > 0.75 ? 'var(--color-streak-fire)' : 'var(--color-gold)'}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke 0.3s' }}
                />
            )}
        </svg>
    );
}

export const ActionButtons = memo(function ActionButtons({
    questionType, onTypeChange, hardMode, onHardModeToggle,
    timedMode, onTimedModeToggle, timerProgress,
}: Props) {
    const handleShare = async () => {
        const shareData = {
            title: 'Math Swipe',
            text: 'Try this mental math game! 🧠✨',
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch {
            // User cancelled share
        }
    };

    return (
        <div className="absolute right-3 top-[38%] -translate-y-1/2 flex flex-col gap-5 z-20">
            {/* Share — TikTok-style thick arrow */}
            <motion.button
                onClick={handleShare}
                className="w-11 h-11 flex items-center justify-center text-white/50 active:text-[var(--color-gold)]"
                whileTap={{ scale: 0.88 }}
            >
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
            </motion.button>

            {/* Question type */}
            <QuestionTypePicker current={questionType} onChange={onTypeChange} />

            {/* Stopwatch / timed mode */}
            <motion.button
                onClick={onTimedModeToggle}
                className={`w-11 h-11 relative flex items-center justify-center ${timedMode
                    ? 'text-[var(--color-gold)]'
                    : 'text-white/50'
                    }`}
                whileTap={{ scale: 0.88 }}
            >
                <TimerRing progress={timerProgress} active={timedMode} />
                <motion.svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={timedMode ? { rotate: [0, -6, 6, -3, 3, 0] } : {}}
                    transition={timedMode ? {
                        duration: 1.8,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                    } : {}}
                >
                    {/* Stopwatch body */}
                    <circle cx="12" cy="14" r="7" />
                    {/* Top button */}
                    <line x1="12" y1="3" x2="12" y2="7" />
                    {/* Top bar */}
                    <line x1="9" y1="3" x2="15" y2="3" />
                    {/* Minute hand */}
                    <line x1="12" y1="14" x2="12" y2="10" />
                </motion.svg>
            </motion.button>

            {/* Hard mode skull */}
            <motion.button
                onClick={onHardModeToggle}
                className={`w-11 h-11 flex items-center justify-center text-2xl ${hardMode
                    ? 'text-[var(--color-gold)]'
                    : 'text-white/50'
                    }`}
                whileTap={{ scale: 0.88 }}
                animate={hardMode ? {
                    rotate: [0, -8, 8, -5, 5, 0],
                    scale: [1, 1.1, 1, 1.05, 1],
                } : {}}
                transition={hardMode ? {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut' as const,
                } : {}}
            >
                💀
            </motion.button>
        </div>
    );
});
