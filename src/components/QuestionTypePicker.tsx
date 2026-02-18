import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionType } from '../utils/mathGenerator';
import { QUESTION_TYPES, GROUP_LABELS, type QuestionGroup } from '../utils/questionTypes';

interface Props {
    current: QuestionType;
    onChange: (type: QuestionType) => void;
}

const GROUPS: QuestionGroup[] = ['basic', 'powers', 'advanced', 'mixed'];

export const QuestionTypePicker = memo(function QuestionTypePicker({ current, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const currentEntry = QUESTION_TYPES.find(t => t.id === current);
    const currentIcon = currentEntry?.icon || '×';

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

            {/* Full-screen overlay picker — portaled to body to escape #root's position:fixed */}
            {createPortal(
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

                            {/* Centered grouped picker */}
                            <motion.div
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/90 border border-white/15 rounded-2xl px-4 py-4 max-h-[70vh] overflow-y-auto w-[280px]"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.15 }}
                            >
                                {GROUPS.map(group => {
                                    const items = QUESTION_TYPES.filter(t => t.group === group);
                                    return (
                                        <div key={group} className="mb-3 last:mb-0">
                                            {/* Group header */}
                                            <div className="text-[9px] ui text-white/25 uppercase tracking-widest mb-2 px-1">
                                                {GROUP_LABELS[group]}
                                            </div>
                                            {/* 3-column grid */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {items.map(t => (
                                                    <motion.button
                                                        key={t.id}
                                                        onClick={() => { onChange(t.id); setOpen(false); }}
                                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors ${t.id === current
                                                            ? 'bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40'
                                                            : 'border border-transparent active:bg-white/5'
                                                            }`}
                                                        whileTap={{ scale: 0.92 }}
                                                    >
                                                        <span className={`text-xl chalk ${t.id === current ? 'text-[var(--color-gold)]' : 'text-white/60'}`}>
                                                            {t.icon}
                                                        </span>
                                                        <span className={`text-[8px] ui ${t.id === current ? 'text-[var(--color-gold)]/80' : 'text-white/30'}`}>
                                                            {t.label}
                                                        </span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
});
