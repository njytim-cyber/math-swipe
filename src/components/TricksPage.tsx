import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAGIC_TRICKS, type MagicTrick } from '../utils/mathTricks';
import { TrickLesson } from './TrickLesson';

interface Props {
    onLessonActive: (active: boolean) => void;
}

export function TricksPage({ onLessonActive }: Props) {
    const [selectedTrick, setSelectedTrick] = useState<MagicTrick | null>(null);

    // Sync active state upwards safely
    useEffect(() => {
        onLessonActive(!!selectedTrick);
    }, [selectedTrick, onLessonActive]);

    // If a trick is selected, hand off rendering gracefully to the lesson loop.
    if (selectedTrick) {
        return (
            <AnimatePresence mode="wait">
                <TrickLesson
                    trick={selectedTrick}
                    onClose={() => setSelectedTrick(null)}
                />
            </AnimatePresence>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col pt-[max(env(safe-area-inset-top,12px),12px)] px-4 pb-24 overflow-y-auto"
        >
            <div className="text-center mb-6">
                <h1 className="text-3xl chalk text-[var(--color-gold)] mb-1">Magic School</h1>
                <p className="text-xs ui text-[rgb(var(--color-fg))]/50">Master mental math shortcuts</p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto w-full">
                {MAGIC_TRICKS.map(trick => (
                    <motion.button
                        key={trick.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTrick(trick)}
                        className="w-full text-left bg-[rgb(var(--color-fg))]/[0.02] border border-[rgb(var(--color-fg))]/10 
                                   rounded-xl p-4 flex items-center gap-4 transition-colors hover:bg-[rgb(var(--color-fg))]/5 relative overflow-hidden group"
                    >
                        {/* Difficulty indicator line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-gold)] opacity-30 group-hover:opacity-100 transition-opacity" />

                        <div className="w-12 h-12 rounded-full bg-[rgb(var(--color-fg))]/5 flex items-center justify-center text-2xl">
                            {trick.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="chalk text-lg text-[rgb(var(--color-fg))]/90 group-hover:text-[var(--color-gold)] transition-colors">
                                {trick.title}
                            </h3>
                            <p className="ui text-[10px] text-[rgb(var(--color-fg))]/50 leading-tight mt-1">
                                {trick.description}
                            </p>
                        </div>
                        <div className="ui text-xs font-bold px-2 py-1 rounded-md bg-[rgb(var(--color-fg))]/10 text-[rgb(var(--color-fg))]/40">
                            {'★'.repeat(trick.difficulty)}
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
