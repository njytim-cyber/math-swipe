import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

function buildShareText(
    xp: number, streak: number, accuracy: number,
    history: boolean[], questionType: string,
): string {
    // Build Wordle-style grid (max 20 chars per row)
    const grid = history.map(ok => ok ? '🟩' : '🟥').join('');
    const rows: string[] = [];
    // Split into rows of 10
    for (let i = 0; i < grid.length; i += 20) {  // 20 chars = 10 emoji (each emoji is 2 chars in some envs)
        rows.push(grid.slice(i, i + 20));
    }
    // Actually emoji length varies, let's split by count
    const emojis = history.map(ok => ok ? '🟩' : '🟥');
    const emojiRows: string[] = [];
    for (let i = 0; i < emojis.length; i += 10) {
        emojiRows.push(emojis.slice(i, i + 10).join(''));
    }

    const typeLabel = questionType.startsWith('mix-') ? 'Mix' : questionType.charAt(0).toUpperCase() + questionType.slice(1);
    const headline = accuracy === 100
        ? `🧮 Math Swipe — PERFECT! 💯`
        : `🧮 Math Swipe — ${typeLabel}`;

    return [
        headline,
        `⚡ ${xp} XP · 🔥 ${streak} streak · 🎯 ${accuracy}%`,
        '',
        ...emojiRows,
        '',
        `Can you beat me? 👉 ${window.location.origin}`,
    ].join('\n');
}

export const SessionSummary = memo(function SessionSummary({
    solved, bestStreak: streak, accuracy, xpEarned, answerHistory, questionType, visible, onDismiss,
}: Props) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const text = buildShareText(xpEarned, streak, accuracy, answerHistory, questionType);

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
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onDismiss}
                >
                    <motion.div
                        className="bg-[var(--color-board)] border border-white/15 rounded-3xl px-8 py-6 max-w-xs w-full text-center"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={e => e.stopPropagation()}
                    >
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
                                <div className="text-2xl mb-4">📝</div>
                                <h3 className="text-xl chalk text-[var(--color-gold)] mb-4">Session Complete</h3>
                            </>
                        )}

                        <div className="flex justify-center gap-6 mb-4">
                            <div className="text-center">
                                <div className="text-2xl chalk text-white/80">{solved}</div>
                                <div className="text-[9px] ui text-white/30">solved</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl chalk text-[var(--color-correct)]">{accuracy}%</div>
                                <div className="text-[9px] ui text-white/30">accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl chalk text-[var(--color-streak-fire)]">{streak}🔥</div>
                                <div className="text-[9px] ui text-white/30">best streak</div>
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

                        <div className="text-lg chalk text-[var(--color-gold)] mb-4">+{xpEarned} XP</div>

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
                            className="text-xs ui text-white/30 hover:text-white/50 transition-colors"
                        >
                            tap to continue
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
