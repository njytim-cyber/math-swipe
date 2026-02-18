import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    solved: number;
    correct: number;
    bestStreak: number;
    accuracy: number;
    xpEarned: number;
    visible: boolean;
    onDismiss: () => void;
}

export const SessionSummary = memo(function SessionSummary({
    solved, bestStreak: streak, accuracy, xpEarned, visible, onDismiss,
}: Props) {
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
                        <div className="text-2xl mb-4">📝</div>
                        <h3 className="text-xl chalk text-[var(--color-gold)] mb-4">Session Complete</h3>

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

                        <div className="text-lg chalk text-[var(--color-gold)] mb-4">+{xpEarned} XP</div>

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
