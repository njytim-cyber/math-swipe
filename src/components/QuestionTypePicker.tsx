import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionType } from '../utils/mathGenerator';
import { QUESTION_TYPES } from '../utils/questionTypes';

interface Props {
    current: QuestionType;
    onChange: (type: QuestionType) => void;
}

export const QuestionTypePicker = memo(function QuestionTypePicker({ current, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const currentIcon = QUESTION_TYPES.find(t => t.id === current)?.icon || '×';

    return (
        <>
            {/* Toggle button */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center text-white/70 text-lg chalk active:text-[var(--color-gold)]"
                whileTap={{ scale: 0.88 }}
            >
                {currentIcon}
            </motion.button>

            {/* Full-screen overlay picker */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Dim backdrop — tap to close */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setOpen(false)}
                        />

                        {/* Centered picker row */}
                        <motion.div
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex gap-3 bg-black/80 border border-white/15 rounded-2xl px-4 py-3"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                        >
                            {QUESTION_TYPES.map(t => (
                                <motion.button
                                    key={t.id}
                                    onClick={() => { onChange(t.id); setOpen(false); }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl chalk transition-colors ${t.id === current
                                        ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40'
                                        : 'text-white/60 active:text-white/90 border border-transparent'
                                        }`}
                                    whileTap={{ scale: 0.88 }}
                                >
                                    {t.icon}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
});
