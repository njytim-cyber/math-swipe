import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MagicTrick } from '../utils/mathTricks';

interface Props {
    trick: MagicTrick;
    onClose: () => void;
}

export function TrickPractice({ trick, onClose }: Props) {
    const TOTAL_QUESTIONS = 5;

    // A rapid-fire barrage state
    const [progress, setProgress] = useState(0);
    const [questions, setQuestions] = useState(() => {
        const qs: ReturnType<typeof trick.generatePractice>[] = [];
        const seen = new Set<string>();
        let safety = 0;
        while (qs.length < TOTAL_QUESTIONS && safety < 100) {
            safety++;
            const q = trick.generatePractice();
            if (!seen.has(q.expression)) {
                seen.add(q.expression);
                qs.push(q);
            }
        }
        // Fallback if range is truly tiny
        while (qs.length < TOTAL_QUESTIONS) qs.push(trick.generatePractice());
        return qs;
    });

    const [flash, setFlash] = useState<'' | 'correct' | 'wrong'>('');
    const [frozen, setFrozen] = useState(false);

    const current = questions[progress];
    const MAX_QUESTIONS = TOTAL_QUESTIONS + 10; // Cap runaway wrong-answer extensions

    const handleAnswer = (ans: number) => {
        if (frozen || !current) return; // Guard against multi-tap and null current
        if (ans === current.answer) {
            setFrozen(true);
            setFlash('correct');
            setTimeout(() => {
                setFlash('');
                setFrozen(false);
                setProgress(p => p + 1);
            }, 300);
        } else {
            setFrozen(true);
            setFlash('wrong');
            setTimeout(() => {
                setFlash('');
                setFrozen(false);
            }, 400);
            // On wrong answer, push a new question (capped to prevent infinite growth)
            if (questions.length < MAX_QUESTIONS) {
                setQuestions(q => [...q, trick.generatePractice()]);
            }
        }
    };

    const isComplete = progress >= TOTAL_QUESTIONS;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`absolute inset-0 bg-[var(--color-bg)] z-50 flex flex-col pt-[max(env(safe-area-inset-top,12px),12px)] px-4 pb-[env(safe-area-inset-bottom,12px)]
                      ${flash === 'wrong' ? 'wrong-shake' : flash === 'correct' ? 'answer-bounce' : ''}`}
        >
            {/* Feedback overlay */}
            {flash !== '' && (
                <div className={`absolute inset-0 pointer-events-none z-30 ${flash === 'correct' ? 'flash-correct' : 'flash-wrong'}`} />
            )}

            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center text-[rgb(var(--color-fg))]/50 bg-[rgb(var(--color-fg))]/5 rounded-full"
                >
                    ✕
                </button>
                <div className="ui text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-bold">
                    Practice Blitz
                </div>
                <div className="w-10" />
            </div>

            {!isComplete ? (
                <div className="flex-1 flex flex-col pt-[15vh]">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-12">
                        {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-colors ${i < progress ? 'bg-[var(--color-gold)]' : 'bg-[rgb(var(--color-fg))]/10'}`}
                            />
                        ))}
                    </div>

                    {/* Question Display */}
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={progress}
                            initial={{ scale: 0.8, opacity: 0, filter: 'blur(4px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ scale: 1.2, opacity: 0, filter: 'blur(4px)' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="text-center mb-16"
                        >
                            <div className="text-6xl chalk">{current.expression}</div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-4 w-full max-w-sm mx-auto mt-auto mb-12">
                        {current.options.map((opt, i) => (
                            <motion.button
                                key={`${progress}-${i}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer(opt)}
                                className="h-20 bg-[rgb(var(--color-fg))]/5 border-2 border-[rgb(var(--color-fg))]/10 
                                         rounded-2xl chalk text-4xl text-[var(--color-gold)] hover:bg-[rgb(var(--color-fg))]/10 transition-colors"
                            >
                                {opt}
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Mastery State */
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center -mt-12"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-8xl mb-8"
                    >
                        🏆
                    </motion.div>
                    <h2 className="chalk text-4xl text-[var(--color-gold)] mb-4">Mastered!</h2>
                    <p className="ui mb-12 text-[rgb(var(--color-fg))]/60 px-8">
                        You've unlocked the secret to <span className="text-[var(--color-gold)]">{trick.title}</span>.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full max-w-[240px] h-14 bg-[var(--color-gold)] text-[#1a1a2e] rounded-xl font-bold ui text-lg shadow-[0_4px_0_rgb(var(--color-fg),0.2)] active:translate-y-1 active:shadow-none transition-all"
                    >
                        Back to Hub
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}
