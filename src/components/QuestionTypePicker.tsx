import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionType } from '../utils/mathGenerator';

const TYPES: { id: QuestionType; icon: string }[] = [
    { id: 'add', icon: '+' },
    { id: 'subtract', icon: '−' },
    { id: 'multiply', icon: '×' },
    { id: 'divide', icon: '÷' },
    { id: 'square', icon: 'x²' },
    { id: 'sqrt', icon: '√' },
];

interface Props {
    current: QuestionType;
    onChange: (type: QuestionType) => void;
}

export function QuestionTypePicker({ current, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const currentIcon = TYPES.find(t => t.id === current)?.icon || '×';

    return (
        <div className="relative">
            {/* Toggle button */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center text-white/70 text-lg font-[family-name:var(--font-chalk)] active:text-[var(--color-gold)]"
                whileTap={{ scale: 0.88 }}
            >
                {currentIcon}
            </motion.button>

            {/* Picker dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 flex gap-2 bg-black/60 border border-white/15 rounded-2xl px-3 py-2"
                    >
                        {TYPES.map(t => (
                            <motion.button
                                key={t.id}
                                onClick={() => { onChange(t.id); setOpen(false); }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-[family-name:var(--font-chalk)] transition-colors ${t.id === current
                                        ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40'
                                        : 'text-white/60 hover:text-white/90 border border-transparent'
                                    }`}
                                whileTap={{ scale: 0.88 }}
                            >
                                {t.icon}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
