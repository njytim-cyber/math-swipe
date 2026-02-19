import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValueEvent } from 'framer-motion';
import { createChallengeId } from '../utils/dailyChallenge';

interface Props {
    solved: number;
    correct: number;
    bestStreak: number;
    accuracy: number;
    xpEarned: number;
    answerHistory: boolean[];
    questionType: string;
    visible: boolean;
    onDismiss: () => void;
    hardMode?: boolean;
    timedMode?: boolean;
}

function buildShareText(
    xp: number, streak: number, accuracy: number,
    history: boolean[], questionType: string,
    hardMode?: boolean, timedMode?: boolean,
): string {
    const emojis = history.map(ok => ok ? '🟩' : '🟥');
    const emojiRows: string[] = [];
    for (let i = 0; i < emojis.length; i += 10) {
        emojiRows.push(emojis.slice(i, i + 10).join(''));
    }

    const typeLabel = questionType.startsWith('mix-') ? 'Mix' : questionType.charAt(0).toUpperCase() + questionType.slice(1);
    const modeTag = hardMode && timedMode ? ' 💀⏱️ ULTIMATE' : hardMode ? ' 💀 HARD' : timedMode ? ' ⏱️ TIMED' : '';
    const headline = accuracy === 100
        ? `🧮 Math Swipe — PERFECT! 💯${modeTag}`
        : `🧮 Math Swipe — ${typeLabel}${modeTag}`;

    // Generate a challenge link so the recipient can play the same set
    const challengeUrl = `${window.location.origin}?c=${createChallengeId()}`;

    return [
        headline,
        `⚡ ${xp} pts · 🔥 ${streak} streak · 🎯 ${accuracy}%`,
        '',
        ...emojiRows,
        '',
        `Can you beat me? 👉 ${challengeUrl}`,
    ].join('\n');
}

export const SessionSummary = memo(function SessionSummary({
    solved, bestStreak: streak, accuracy, xpEarned, answerHistory, questionType, visible, onDismiss,
    hardMode, timedMode,
}: Props) {
    const [copied, setCopied] = useState(false);

    // Rolling count-up for XP
    const xpSpring = useSpring(0, { stiffness: 60, damping: 20 });
    const [xpDisplay, setXpDisplay] = useState(0);

    useMotionValueEvent(xpSpring, 'change', (v) => {
        setXpDisplay(Math.round(v));
    });

    useEffect(() => {
        if (visible) {
            xpSpring.jump(0);
            // Small delay so the modal animates in first
            const t = setTimeout(() => xpSpring.set(xpEarned), 300);
            return () => clearTimeout(t);
        }
    }, [visible, xpEarned, xpSpring]);

    const handleShare = async () => {
        const text = buildShareText(xpEarned, streak, accuracy, answerHistory, questionType, hardMode, timedMode);

        try {
            if (navigator.share) {
                await navigator.share({ text });
            } else {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            // User cancelled or share failed — try clipboard
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // Silent fail
            }
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay-dim)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onDismiss}
                >
                    <motion.div
                        className="bg-[var(--color-board)] border border-[rgb(var(--color-fg))]/15 rounded-3xl px-8 py-6 max-w-xs w-full text-center relative overflow-hidden"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Emoji rain — performance-based floating emojis */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                            {(() => {
                                const emojis: string[] = [];
                                if (streak >= 5) emojis.push('🔥');
                                if (accuracy >= 90) emojis.push('⭐');
                                if (accuracy === 100) emojis.push('🎯', '💯');
                                if (solved >= 20) emojis.push('💪');
                                if (emojis.length === 0) emojis.push('✨');
                                return Array.from({ length: 12 }, (_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute text-lg"
                                        style={{ left: `${8 + (i * 7.5) % 84}%` }}
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 300, opacity: [0, 0.7, 0.7, 0] }}
                                        transition={{
                                            duration: 2.5 + Math.random() * 1.5,
                                            delay: 0.3 + i * 0.15,
                                            ease: 'easeIn',
                                        }}
                                    >
                                        {emojis[i % emojis.length]}
                                    </motion.div>
                                ));
                            })()}
                        </div>
                        {accuracy === 100 ? (
                            <>
                                <motion.div
                                    className="text-3xl mb-2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    🏆
                                </motion.div>
                                <motion.h3
                                    className="text-2xl chalk text-[var(--color-gold)] mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.3, 1] }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    ✨ PERFECT ✨
                                </motion.h3>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl mb-2">📝</div>
                                {(hardMode || timedMode) && (
                                    <div className="text-xs ui text-[rgb(var(--color-fg))]/40 mb-1">
                                        {hardMode && timedMode ? '💀⏱️ ULTIMATE MODE' : hardMode ? '💀 HARD MODE' : '⏱️ TIMED MODE'}
                                    </div>
                                )}
                                <h3 className="text-xl chalk text-[var(--color-gold)] mb-4">Session Complete</h3>
                            </>
                        )}

                        <div className="flex justify-center gap-6 mb-4">
                            <div className="text-center">
                                <div className="text-2xl chalk text-[rgb(var(--color-fg))]/80">{solved}</div>
                                <div className="text-[9px] ui text-[rgb(var(--color-fg))]/30">solved</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl chalk text-[var(--color-correct)]">{accuracy}%</div>
                                <div className="text-[9px] ui text-[rgb(var(--color-fg))]/30">accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl chalk text-[var(--color-streak-fire)]">{streak}🔥</div>
                                <div className="text-[9px] ui text-[rgb(var(--color-fg))]/30">best streak</div>
                            </div>
                        </div>

                        {/* Answer history grid */}
                        {answerHistory.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-[3px] mb-4 max-w-[220px] mx-auto">
                                {answerHistory.map((ok, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={`w-4 h-4 rounded-sm ${ok ? 'bg-[var(--color-correct)]' : 'bg-[var(--color-wrong)]'}`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="text-lg chalk text-[var(--color-gold)] mb-4 tabular-nums">+{xpDisplay} pts</div>

                        {/* Share button */}
                        <motion.button
                            onClick={handleShare}
                            className="w-full py-2.5 rounded-xl bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/30 text-sm ui text-[var(--color-gold)] mb-3 active:bg-[var(--color-gold)]/30 transition-colors"
                            whileTap={{ scale: 0.95 }}
                        >
                            {copied ? '✅ Copied!' : '📤 Share Result'}
                        </motion.button>

                        <button
                            onClick={onDismiss}
                            className="text-xs ui text-[rgb(var(--color-fg))]/30 hover:text-[rgb(var(--color-fg))]/50 transition-colors"
                        >
                            tap to continue
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
